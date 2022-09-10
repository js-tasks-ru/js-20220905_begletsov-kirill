/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    
    

    return [...arr].sort((a,b)=>{
        const letter = a;
        if (a.toLowerCase() === b) {
            a = b
            b = letter
        } 
        return param === 'asc' ? a.localeCompare(b): b.localeCompare(a);;
    } ) 

}
