const azertyKeymap = {
    "&" : "1",
    "é" : "2",
    "\"" : "3",
    "'" : "4",
    '(' : "5",
    '§' : "6",
    'è' : "7",
    "!" : "8",
    "ç" : "9",
    "à" : "0",
}

// funny story, barcode scanners hold the shift key when sending numbers in azerty layout
// however Microsoft Remote Desktop isn't fast enough to transmit all these
// resulting in partial non numeric output.
// Linux RDP clients have no issues
const superCrazyAzertyBarcodeFix = (input) => {
    for (let character in azertyKeymap) {
        input = input.split(character).join(azertyKeymap[character]) // JS replace only replaces 1
    }

    return input
}


export const keyboardHelper = {
    superCrazyAzertyBarcodeFix,
};