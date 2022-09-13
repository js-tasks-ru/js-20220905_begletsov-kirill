/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size === undefined) return string;
    let counter = 0
    let result = ''
    for (let i = 0; i < string.length - 1; i++) {

        const item = string[i]
        const nextItem = string[i + 1]

        if (item === nextItem && counter < size) {
           result += item
           counter++
        }else if (item === nextItem && counter >= size){
            counter ++
        }else if (item !== nextItem && counter < size){
            result += item
            counter = 0
        }else if (item !== nextItem && counter >= size){
            counter = 0
        }

    }
    if (string[string.length - 2] !== string[string.length - 1]){
        result += string[string.length - 1]
    }
    return result;
}
