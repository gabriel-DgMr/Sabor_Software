export const validarCaracteresEspeciales = (valor, campo) => {
    const caracteresProhibidos = /[<>"'/\\(){}[\]=;:%&]/;
    if (caracteresProhibidos.test(valor)) {
        return `El campo ${campo} no puede contener caracteres especiales como < > " ' / \\ ( ) { } [ ] = ; : % &`;
    }
    return null;
};