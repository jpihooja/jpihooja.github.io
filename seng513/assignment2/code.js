//
// this is just a stub for a function you need to implement
//
function getStats(txt) {
    return {
        nChars: getNumberOfCharacters(txt),
        nWords: getNumberOfWords(txt),
        nLines: getNumberOfLines(txt),
        nNonEmptyLines: getNonEmptyNumberOfLines(txt),
        maxLineLength: getMaxLineLength(txt),
        averageWordLength: getAvgWordLength(txt),
        palindromes: getPalindromeList(txt),
        longestWords: longestWords10(txt),
        mostFrequentWords: mostFrequentWords10(txt)
    };


    /* Helper function to add a new line to text that does not already have one to simplify regex tests */
    function addNewLine(txt){
        if(txt.length > 0) {
            return String(txt) + "\n";
        }
    }

    function getNumberOfCharacters(txt) {
        // could be [^.]
        //     let regex = /[\w\W\s]/g;
        let regex = /(.|\n)/g;
        let result = 0;
        if (regex.test(txt)) {
            result = txt.match(regex).length;
        }
        return result;
    }

    function getNumberOfWords(txt) {
        // Global flag 'g' must be set to move pointer across iterations
        // Case insensitive flag set
        // Replace symbols with spaces, since we are not guaranteed
        // there is a space after punctuation or symbols.
        let symbolRegex = /[^0-9a-z\s]/gi;
        let charRemovedString = txt.replace(symbolRegex," ");

        let regex = /[a-z0-9]*['-]*[a-z0-9]+[']*/gi;
        let result = 0;
        if (regex.test(charRemovedString)) {
            result = charRemovedString.match(regex).length;
        }
        return result;
    }

    function getNumberOfLines(txt) {
        let regex = /.*\n/g;
        let newLinedText = addNewLine(txt);
        let result = 0;
        if (regex.test(newLinedText)) {
            result= newLinedText.match(regex).length;
        }
        // String is empty, no lines
        return result;
    }

    function getNonEmptyNumberOfLines(txt){
        let regex = /\n?.*\S.+.*\n?/g;
        let result = 0;
        if (regex.test(txt)) {
            result = txt.match(regex).length;
        }
        return result;
    }

    function getAvgWordLength(txt) {
        // Global flag 'g' must be set to move pointer across iterations
        // Case insensitive flag set
        let symbolRegex = /[^0-9a-z\s]/gi;
        let charRemovedString = txt.replace(symbolRegex, " ");

        let avg = 0;
        let regex = /[a-z0-9]*['-]*[a-z0-9]+[']*/gi;
        if (regex.test(charRemovedString)) {
            let result = charRemovedString.match(regex);
            for (index = 0; index < result.length; index++) {
                avg = avg + (result[index].length / result.length);
            }
        }
        return avg;
    }

    function getMaxLineLength(txt){
        let regex = /.+(?=\n)/g;
        let newLinedText = addNewLine(txt);
        let maxLength = 0;
        if (regex.test(newLinedText)) {
            result = newLinedText.match(regex);
            for(let i = 0; i< result.length; i++){
                if(result[i].length > maxLength){
                    maxLength = result[i].length
                }
            }
        }
        return maxLength;
    }

    function getPalindromeList(txt){
        // Replace symbols with spaces, since we are not guaranteed
        // there is a space after punctuation or symbols.
        let symbolRegex = /[^0-9a-z\'\-\s]/gi;
        let charRemovedString = txt.replace(symbolRegex," ");

        // Remove hyphens and apostrophes
        let symbolRegex2 = /[^0-9a-z\s]/gi;
        charRemovedString = charRemovedString.replace(symbolRegex,"");

        let palindromeList = [];

        // Find all words at least 3 digits long
        let regex = /([a-z0-9]){3,}/gi;
        if(regex.test(charRemovedString)) {

            let result = charRemovedString.match(regex);

            // Loop through results to get the palindromes
            for (let index = 0; index < result.length; index++) {
                let word = result[index].toLowerCase();
                let isPal = true;
                let start = 0;
                let end = result[index].length - 1;
                while (start < end) {
                    if (word[start] !== word[end]) {
                        isPal = false;
                        break;
                    }
                    start++;
                    end--;
                }
                if (isPal) {
                    if (!containsWord(palindromeList, word)) {
                        palindromeList.push(word);
                    }
                }
            }
        }
        return palindromeList;
    }

    function containsWord(array, word){
        for(let i =0; i< array.length; i++){
            if(array[i] === word){
                return true;
            }
        }
        return false;
    }

    function longestWords10(txt){
        // Replace symbols with spaces, since we are not guaranteed
        // there is a space after punctuation or symbols.
        let symbolRegex = /[^0-9a-z\'\-\s]/gi;
        let charRemovedString = txt.replace(symbolRegex," ");

        let longestWords = [];

        // Find all words at least 1 digit long
        let regex = /[a-z0-9]+/gi;
        if(regex.test(charRemovedString)) {
            let result = charRemovedString.match(regex);
            for (let i = 0; i < result.length; i++) {
                let currWord = result[i].toLowerCase();
                let currLen = currWord.length;
                for (let j = 0; j < 10; j++) {
                    currWordStored = longestWords[j];
                    if (currWordStored === undefined) {
                        // We've hit a empty spot, insert here
                        longestWords[j] = currWord;
                        break;
                    } else {
                        // Are we longer than the current word, then shift.
                        if ((currLen > currWordStored.length) ||
                            (currLen === currWordStored.length && currWord <= currWordStored)) {
                            if (currWord === currWordStored) {
                                break;
                            }
                            longestWords.splice(j, 0, currWord);
                            longestWords.splice(10, 1);
                            break;
                        }
                    }
                }
            }
        }
        return longestWords;
    }

    function mostFrequentWords10(txt){
        // Replace symbols with spaces, since we are not guaranteed
        // there is a space after punctuation or symbols.
        let symbolRegex = /[^0-9a-z\'\-\s]/gi;
        let charRemovedString = txt.replace(symbolRegex," ");

        let retWords = [];

        // Find all words at least 1 digit long
        let regex = /[a-z0-9]*['-]*[a-z0-9]+[']*/gi;
        if(regex.test(txt)) {
            let result = txt.match(regex);

            let dict = {};
            for (let i = 0; i < result.length; i++) {
                let currWord = result[i].toLowerCase();
                if (currWord.length < 1) {
                    continue;
                }
                if (dict[currWord] === undefined) {
                    dict[currWord] = 1;
                } else {
                    dict[currWord] = dict[currWord] + 1;
                }
            }

            let frequentWords = [];
            for (let word in dict) {
                let count = dict[word];

                for (let j = 0; j < 10; j++) {
                    currEntry = frequentWords[j];
                    if (currEntry === undefined) {
                        // We've hit a empty spot, insert here
                        frequentWords[j] = [count, word];
                        break;
                    } else {
                        // Are we more frequent than the entry, or at least less in the alphabet
                        let storedCount = currEntry[0];
                        let storedWord = currEntry[1];
                        if ((count > storedCount) ||
                            (count === storedCount && word <= storedWord)) {
                            frequentWords.splice(j, 0, [count, word]);
                            frequentWords.splice(10, 1);
                            break;
                        }
                    }
                }
            }

            // Finally format it like the prof wants.

            for (let i = 0; i < frequentWords.length; i++) {
                let newEntry = frequentWords[i][1] + "(" + frequentWords[i][0] + ")";
                retWords.push(newEntry);
            }
        }
        return retWords;
    }
}

