import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'sabor_db',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

class PerformanceBenchmark {
    constructor() {
        this.pool = null;
        this.results = [];
        this.startTime = null;
    }

    async init() {
        try {
            this.pool = mysql.createPool(config);
            console.log('✅ Database connection pool established');
        } catch (error) {
            console.error('❌ Error connecting to database:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ Database connection pool closed');
        }
    }

    async executeQuery(query, params = []) {
        const startTime = process.hrtime.bigint();
        try {
            const [results] = await this.pool.execute(query, params);
            const endTime = process.hrtime.bigint();
            const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            return { results, executionTime };
        } catch (error) {
            const endTime = process.hrtime.bigint();
            const executionTime = Number(endTime - startTime) / 1000000;
            throw { error, executionTime };
        }
    }

    async generateTestData(recordCount = 1000) {
        console.log(`\n🔄 Generating ${recordCount} test records...`);
        
        const batchSize = 100;
        const batches = Math.ceil(recordCount / batchSize);
        let totalTime = 0;
        let insertedRecords = 0;

        for (let batch = 0; batch < batches; batch++) {
            const currentBatchSize = Math.min(batchSize, recordCount - (batch * batchSize));
            const values = [];
            const placeholders = [];

            for (let i = 0; i < currentBatchSize; i++) {
                const userId = Math.floor(Math.random() * 100) + 1;
                const actions = ['INSERT', 'UPDATE', 'DELETE'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                
                // Generate random dates across different partitions
                const baseDate = new Date('2024-12-01');
                const randomDays = Math.floor(Math.random() * 180); // 6 months spread
                const actionDate = new Date(baseDate.getTime() + (randomDays * 24 * 60 * 60 * 1000));
                
                const oldValues = action === 'INSERT' ? null : JSON.stringify({ nombre: `Old User ${i}`, email: `old${i}@example.com` });
                const newValues = action === 'DELETE' ? null : JSON.stringify({ nombre: `New User ${i}`, email: `new${i}@example.com` });
                const changedBy = Math.floor(Math.random() * 10) + 1;
                
                values.push(userId, action, oldValues, newValues, changedBy, actionDate);
                placeholders.push('(?, ?, ?, ?, ?, ?)');
            }

            const query = `
                INSERT INTO users_audit (id_user, action, old_values, new_values, changed_by, changed_at)
                VALUES ${placeholders.join(', ')}
            `;

            try {
                const { executionTime } = await this.executeQuery(query, values);
                totalTime += executionTime;
                insertedRecords += currentBatchSize;
                
                if (batch % 10 === 0) {
                    console.log(`   Batch ${batch + 1}/${batches} - ${insertedRecords} records inserted`);
                }
            } catch (error) {
                console.error(`❌ Error inserting batch ${batch + 1}:`, error.error?.message || error.message);
            }
        }

        console.log(`✅ Test data generation completed: ${insertedRecords} records in ${totalTime.toFixed(2)}ms`);
        return { insertedRecords, totalTime };
    }

    async runPartitionInfoTest() {
        console.log('\n📊 Testing partition information queries...');
        
        const tests = [
            {
                name: 'Partition Info View',
                query: 'SELECT * FROM v_audit_partition_info ORDER BY partition_name'
            },
            {
                name: 'Partition Statistics',
                query: 'CALL sp_audit_partition_stats()'
            },
            {
                name: 'Table Stats',
                query: `
                    SELECT 
                        TABLE_NAME,
                        TABLE_ROWS,
                        DATA_LENGTH,
                        INDEX_LENGTH,
                        (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users_audit'
                `,
                params: [config.database]
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const { results: queryResults, executionTime } = await this.executeQuery(test.query, test.params || []);
                results.push({
                    name: test.name,
                    executionTime,
                    recordCount: Array.isArray(queryResults) ? queryResults.length : 0,
                    success: true
                });
                console.log(`   ✅ ${test.name}: ${executionTime.toFixed(2)}ms`);
            } catch (error) {
                results.push({
                    name: test.name,
                    executionTime: error.executionTime,
                    error: error.error?.message || error.message,
                    success: false
                });
                console.log(`   ❌ ${test.name}: ${error.error?.message || error.message}`);
            }
        }

        return results;
    }

    async runQueryPerformanceTests() {
        console.log('\n🚀 Testing query performance on partitioned data...');
        
        const tests = [
            {
                name: 'Single Partition Query (Current Month)',
                query: `
                    SELECT COUNT(*) as total_records, action
                    FROM users_audit 
                    WHERE changed_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
                    AND changed_at < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
                    GROUP BY action
                `
            },
            {
                name: 'Multi-Partition Query (Last 3 Months)',
                query: `
                    SELECT COUNT(*) as total_records, DATE_FORMAT(changed_at, '%Y-%m') as month
                    FROM users_audit 
                    WHERE changed_at >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 3 MONTH)
                    GROUP BY DATE_FORMAT(changed_at, '%Y-%m')
                    ORDER BY month
                `
            },
            {
                name: 'User Activity Query',
                query: `
                    SELECT id_user, COUNT(*) as activity_count, MAX(changed_at) as last_activity
                    FROM users_audit 
                    WHERE changed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    GROUP BY id_user
                    ORDER BY activity_count DESC
                    LIMIT 10
                `
            },
            {
                name: 'Action Pattern Analysis',
                query: `
                    SELECT 
                        action,
                        COUNT(*) as count,
                        DATE_FORMAT(changed_at, '%Y-%m') as month
                    FROM users_audit 
                    WHERE changed_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
                    GROUP BY action, DATE_FORMAT(changed_at, '%Y-%m')
                    ORDER BY month, count DESC
                `
            },
            {
                name: 'Specific User History',
                query: `
                    SELECT action, old_values, new_values, changed_at
                    FROM users_audit 
                    WHERE id_user = ? AND changed_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
                    ORDER BY changed_at DESC
                    LIMIT 50
                `,
                params: [1]
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const { results: queryResults, executionTime } = await this.executeQuery(test.query, test.params || []);
                results.push({
                    name: test.name,
                    executionTime,
                    recordCount: Array.isArray(queryResults) ? queryResults.length : 0,
                    success: true
                });
                console.log(`   ✅ ${test.name}: ${executionTime.toFixed(2)}ms (${Array.isArray(queryResults) ? queryResults.length : 0} records)`);
            } catch (error) {
                results.push({
                    name: test.name,
                    executionTime: error.executionTime,
                    error: error.error?.message || error.message,
                    success: false
                });
                console.log(`   ❌ ${test.name}: ${error.error?.message || error.message}`);
            }
        }

        return results;
    }

    async runLoadTest(concurrentQueries = 5, queriesPerConnection = 10) {
        console.log(`\n⚡ Running load test: ${concurrentQueries} concurrent connections, ${queriesPerConnection} queries each...`);
        
        const query = `
            SELECT id_user, action, changed_at
            FROM users_audit 
            WHERE changed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY changed_at DESC
            LIMIT 100
        `;

        const promises = [];
        const startTime = process.hrtime.bigint();

        for (let i = 0; i < concurrentQueries; i++) {
            const connectionPromise = this.runConnectionQueries(query, queriesPerConnection, i);
            promises.push(connectionPromise);
        }

        try {
            const connectionResults = await Promise.all(promises);
            const endTime = process.hrtime.bigint();
            const totalTime = Number(endTime - startTime) / 1000000;

            const totalQueries = concurrentQueries * queriesPerConnection;
            const avgQueryTime = connectionResults.reduce((sum, conn) => sum + conn.avgTime, 0) / concurrentQueries;
            const minTime = Math.min(...connectionResults.map(conn => conn.minTime));
            const maxTime = Math.max(...connectionResults.map(conn => conn.maxTime));
            const successfulQueries = connectionResults.reduce((sum, conn) => sum + conn.successful, 0);
            const failedQueries = connectionResults.reduce((sum, conn) => sum + conn.failed, 0);

            console.log(`✅ Load test completed in ${totalTime.toFixed(2)}ms`);
            console.log(`   Total queries: ${totalQueries}`);
            console.log(`   Successful: ${successfulQueries}`);
            console.log(`   Failed: ${failedQueries}`);
            console.log(`   Average query time: ${avgQueryTime.toFixed(2)}ms`);
            console.log(`   Min query time: ${minTime.toFixed(2)}ms`);
            console.log(`   Max query time: ${maxTime.toFixed(2)}ms`);
            console.log(`   Queries per second: ${((totalQueries / totalTime) * 1000).toFixed(2)}`);

            return {
                totalTime,
                totalQueries,
                successfulQueries,
                failedQueries,
                avgQueryTime,
                minTime,
                maxTime,
                queriesPerSecond: (totalQueries / totalTime) * 1000
            };
        } catch (error) {
            console.error('❌ Load test failed:', error.message);
            throw error;
        }
    }

    async runConnectionQueries(query, queryCount, connectionId) {
        const connection = await this.pool.getConnection();
        const times = [];
        let successful = 0;
        let failed = 0;

        try {
            for (let i = 0; i < queryCount; i++) {
                try {
                    const startTime = process.hrtime.bigint();
                    await connection.execute(query);
                    const endTime = process.hrtime.bigint();
                    const executionTime = Number(endTime - startTime) / 1000000;
                    times.push(executionTime);
                    successful++;
                } catch (error) {
                    failed++;
                }
            }
        } finally {
            connection.release();
        }

        const avgTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
        const minTime = times.length > 0 ? Math.min(...times) : 0;
        const maxTime = times.length > 0 ? Math.max(...times) : 0;

        return { avgTime, minTime, maxTime, successful, failed };
    }

    async saveResults(filename = 'performance_results.json') {
        const filepath = path.join(__dirname, '..', 'logs', filename);
        const timestamp = new Date().toISOString();
        
        const report = {
            timestamp,
            config: {
                host: config.host,
                port: config.port,
                database: config.database
            },
            results: this.results,
            summary: {
                totalTests: this.results.length,
                successfulTests: this.results.filter(r => r.success !== false).length,
                failedTests: this.results.filter(r => r.success === false).length,
                totalExecutionTime: this.results.reduce((sum, r) => sum + (r.executionTime || 0), 0)
            }
        };

        try {
            await fs.mkdir(path.dirname(filepath), { recursive: true });
            await fs.writeFile(filepath, JSON.stringify(report, null, 2));
            console.log(`\n💾 Results saved to: ${filepath}`);
        } catch (error) {
            console.error('❌ Error saving results:', error.message);
        }
    }

    async runFullBenchmark() {
        console.log('🏁 Starting Performance Benchmark Suite');
        console.log('==========================================');
        
        this.startTime = Date.now();
        
        try {
            // Generate test data
            const dataGenResults = await this.generateTestData(2000);
            this.results.push({
                category: 'Data Generation',
                ...dataGenResults,
                success: true
            });

            // Run partition info tests
            const partitionResults = await this.runPartitionInfoTest();
            this.results.push({
                category: 'Partition Info',
                tests: partitionResults,
                success: partitionResults.every(r => r.success)
            });

            // Run query performance tests
            const queryResults = await this.runQueryPerformanceTests();
            this.results.push({
                category: 'Query Performance',
                tests: queryResults,
                success: queryResults.every(r => r.success)
            });

            // Run load test
            const loadResults = await this.runLoadTest(5, 20);
            this.results.push({
                category: 'Load Test',
                ...loadResults,
                success: true
            });

            // Summary
            const totalTime = Date.now() - this.startTime;
            console.log('\n🎯 Benchmark Summary');
            console.log('===================');
            console.log(`Total execution time: ${totalTime}ms`);
            console.log(`Categories tested: ${this.results.length}`);
            console.log(`Overall success: ${this.results.every(r => r.success) ? '✅' : '❌'}`);

            await this.saveResults();

        } catch (error) {
            console.error('❌ Benchmark failed:', error.message);
            throw error;
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'full';
    
    const benchmark = new PerformanceBenchmark();
    
    try {
        await benchmark.init();
        
        switch (command) {
            case 'full':
                await benchmark.runFullBenchmark();
                break;
            case 'data': {
                const count = parseInt(args[1]) || 1000;
                await benchmark.generateTestData(count);
                break;
            }
            case 'query':
                await benchmark.runQueryPerformanceTests();
                break;
            case 'load': {
                const connections = parseInt(args[1]) || 5;
                const queries = parseInt(args[2]) || 10;
                await benchmark.runLoadTest(connections, queries);
                break;
            }
            case 'info':
                await benchmark.runPartitionInfoTest();
                break;
            default:
                console.log('Available commands:');
                console.log('  full                    - Run complete benchmark suite');
                console.log('  data [count]           - Generate test data');
                console.log('  query                  - Run query performance tests');
                console.log('  load [conn] [queries]  - Run load test');
                console.log('  info                   - Run partition info tests');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await benchmark.close();
    }
}

// Check if this is the main module being run
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default PerformanceBenchmark; 