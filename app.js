//Constans - Variables
const searchBtn = document.querySelector("#search-btn");
const inputEng = document.querySelector("#input-eng");
const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const result = document.querySelector(".result");
const translateBox = document.querySelector(".translate-box");
const dictionaryWords = document.querySelector(".dictionary-words");
const openDictionaryBtn = document.querySelector(".open-dictionary-btn");
const closeDictionaryBtn = document.querySelector(".close-dictionary-btn");
let engCard;
let text;
let id;
let pron;
let details;
let meaning;
let example;
let src;
let translation;
let translations;
let saveCard;
let searchResults;
let item;
let showBtn;
let closeBtn;
let darkMode = localStorage.getItem("darkMode");


class Word {
    constructor(text, id) {
        this.text = text;
        this.id = id;
    }
}

class EngCard extends Word {
    constructor(text, id, pron, details, meaning, example, src) {
        super(text, id);
        this.pron = pron;
        this.details = details;
        this.meaning = meaning;
        this.example = example;
        this.src = src;
    }

}

class FinalCard extends EngCard {
    constructor(text, id, pron, details, meaning, example, src, translation) {
        super(text, id, pron, details, meaning, example, src)
        this.translation = translation;
    }
}


/*------------------UI-----------------------*/
//UI Class

class UI {
    //Translate
    static translate() {
        //Create Word
        const text = inputEng.value;
        const id = Math.random() * 1000000;
        //Instatntiate word
        const word = new Word(text, id);

        //Create EngCard
        fetch(`${url}${text}`)
            .then((response) => response.json())
            .then((data) => {
                //Get values for engCard
                const pron = data[0].phonetics[((data[0].phonetics).length) - 1].text;
                const details = data[0].meanings[0].partOfSpeech;
                const meaning = data[0].meanings[0].definitions[0].definition;
                const example = data[0].meanings[0].definitions[0].example;
                const src = data[0].phonetics[((data[0].phonetics).length) - 1].audio;
                //Instatntiate EngCard
                const engCard = new EngCard(text, id, pron, details, meaning, example, src);
                //Display EngCard
                document.querySelector("#search-results").className = "search-results-d-block";
                result.innerHTML = `
                <div class="word" id="${id}">
                    <h3>${text}</h3>
                    <button id="volume-btn">
                        <i class="fa-solid fa-volume-up fa-volume-up-1"></i>
                        <audio src="${src}" id="sound"></audio>
                    </button>
                 </div>

                 <p class="pron">${pron || ""}</p> 

                <div class="details">
                    <p>${details}</p>
                </div>

                <p class="word-meaning">
                    ${meaning || ""}
                </p>
                <p class="word-example">
                    ${example || ""}
                </p>
                
                `


                //Clear Field
                setTimeout(() => {
                    UI.clearField(inputEng)
                }, 200);

                //Create translation-box
                translateBox.innerHTML = `
                    <input type="text" placeholder="Type translation here.." id="input-hu">
                    <button id="save-btn">Save</button>
                `
                document.querySelector("#save-btn").addEventListener("click", saveTranslation)

                document.querySelector("#input-hu").addEventListener("keypress", function (e) {
                    if (e.key === "Enter") {
                        saveTranslation();
                    }
                });

                function saveTranslation() {
                    const inputHU = document.querySelector("#input-hu")
                    if (inputHU.value != "") {
                        const p = document.createElement("p");
                        p.innerHTML = inputHU.value;
                        p.classList.add("translation-item");
                        document.querySelector(".translations").appendChild(p);
                        UI.clearField(inputHU)


                        let saveCardBtn = document.querySelector(".save-card-btn");
                        if (saveCardBtn === null) {

                            saveCardBtn = document.createElement("button");
                            saveCardBtn.classList.add("save-card-btn");
                            saveCardBtn.innerHTML = "Save Card"
                            document.querySelector(".save-card").appendChild(saveCardBtn);
                        }
                        saveCardBtn.addEventListener("click", function () {
                            const translation = document.querySelector(".translation-item").innerHTML;
                            const finalCard = new FinalCard(text, id, pron, details, meaning, example, src, translation);

                            //Add finalCard to Dictionary
                            UI.addFinalCardToList(finalCard);


                            //Clear

                            translations = document.querySelector(".translations");
                            saveCard = document.querySelector(".save-card");
                            searchResults = document.querySelector("#search-results");
                            UI.clearArea(translations);
                            UI.clearArea(result);
                            UI.clearArea(translateBox);
                            UI.clearArea(saveCard);
                            UI.clearArea(saveCardBtn);
                            UI.className(searchResults, "search-results-d-none");



                            // Add finalCard to store
                            Store.addFinalCardToStore(finalCard);

                        })
                    }
                }
            })
    }

    static playSound(volume1Btn) {
        volume1Btn.nextElementSibling.play();
    }

    static clearField(field) {
        field.value = "";
    }

    static clearArea(area) {
        area.innerHTML = "";
    }

    static className(item, newClassName) {
        item.className = newClassName
    }

    static addFinalCardToList(finalCard) {

        const item = document.createElement("div");
        item.classList.add("item")
        item.innerHTML = `
            <div class="flex">
                <div class="eng">
                    <button id="volume2-btn">
                        <i class="fa-solid fa-volume-up"></i>
                        <audio src="${finalCard.src}" id="sound"></audio>
                    </button>
                    <h3 class="item-h3-eng">${finalCard.text}</h3>
                </div>
                <div class=dictionary-result>
                    <h3 class="item-h3-hu d-none">${finalCard.translation}</h3>
                    <button class="show-btn">Show</button>
                    <button class="delete-btn" data-id="${finalCard.id}">Delete</button>
                </div>
            </div>
            <div class="meaning d-none">
                <h3 class="h3-meaning">${finalCard.meaning}</h3>
            </div>
        `
        dictionaryWords.appendChild(item);
        dictionaryWords.classList.add("fade-in");
    }

    static openDictionary() {
        const items = document.querySelectorAll(".item")
        items.forEach((item) => {
            dictionaryWords.removeChild(item)
        })

        dictionaryWords.classList.remove("fade-in")
        const dictionaryCards = Store.getFinalCardsFromStore();
        dictionaryCards.forEach((dictionaryCard) => UI.addFinalCardToList(dictionaryCard))
        openDictionaryBtn.classList.add("hide");
        closeDictionaryBtn.classList.remove("hide");
        closeDictionaryBtn.classList.add("show");
    }

    static closeDictionary() {
        closeDictionaryBtn.classList.remove("show");
        closeDictionaryBtn.classList.add("hide");
        openDictionaryBtn.classList.remove("hide");
        openDictionaryBtn.classList.add("show");

        const items = document.querySelectorAll(".item")
        items.forEach((item) => {
            dictionaryWords.removeChild(item)
        })

        dictionaryWords.classList.remove("fade-in")
    }

    static playAudio(targetButton) {
        if (targetButton.classList.contains("fa-volume-up")) {
            targetButton.nextElementSibling.play()
        }
    }

    static showHide(showHideButton) {
        if (showHideButton.classList.contains("show-btn")) {
            showHideButton.innerHTML = "Hide";
            showHideButton.className = "hide-btn"
            showHideButton.parentElement.firstElementChild.className = "d-block";
            showHideButton.parentElement.parentElement.nextElementSibling.classList.remove("d-none")
            showHideButton.parentElement.parentElement.nextElementSibling.classList.add("d-block");
        } else if (showHideButton.classList.contains("hide-btn")) {
            showHideButton.innerHTML = "Show";
            showHideButton.className = "show-btn"
            showHideButton.parentElement.firstElementChild.className = "d-none";
            showHideButton.parentElement.parentElement.nextElementSibling.classList.remove("d-block")
            showHideButton.parentElement.parentElement.nextElementSibling.classList.add("d-none");
        }
    }

    static deleteCard(el) {
        if (el.classList.contains("delete-btn")) {
            el.parentElement.parentElement.parentElement.remove()
        }
    }

}

/*------------------Store-----------------------*/
//Store Class

class Store {

    static getFinalCardsFromStore() {
        let dictionaryCards;
        if (localStorage.getItem("dictionaryCards") === null) {
            dictionaryCards = [];
        } else {
            dictionaryCards = JSON.parse(localStorage.getItem("dictionaryCards"));
        }

        return dictionaryCards;

    }

    static addFinalCardToStore(finalCard) {

        const dictionaryCards = Store.getFinalCardsFromStore();
        dictionaryCards.push(finalCard);
        localStorage.setItem("dictionaryCards", JSON.stringify(dictionaryCards))
    }

    static removeCardFromStore(id) {
        const dictionaryCards = Store.getFinalCardsFromStore();
        console.log(dictionaryCards, id)
        dictionaryCards.forEach((dictionaryCard, index) => {
            if (dictionaryCard.id === +id) {

                dictionaryCards.splice(index, 1)
            }
        })
        localStorage.setItem("dictionaryCards", JSON.stringify(dictionaryCards))
    }

    static enableDarkMode() {
        localStorage.setItem("darkMode", "enabled");
        document.body.classList.add("dark");
    }

    static disableDarkMode() {
        localStorage.setItem("darkMode", null);
        document.body.classList.remove("dark");
    }

    static getMode() {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches || darkMode === "enabled") {
            Store.enableDarkMode();
        };
    }

}



/*------------------Events-----------------------*/

searchBtn.addEventListener("click", () => {
    UI.translate();
});

inputEng.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        UI.translate();
    }
});

openDictionaryBtn.addEventListener("click", () => {
    UI.openDictionary()
});
closeDictionaryBtn.addEventListener("click", () => {

    UI.closeDictionary()
});

//Volume Event on Result
result.addEventListener("click", (e) => {
    UI.playAudio(e.target)
})

//Events in dictionary
dictionaryWords.addEventListener("click", (e) => {

    //Play Audio
    UI.playAudio(e.target);

    //Show-Hide
    UI.showHide(e.target)

    //Remove from UI
    UI.deleteCard(e.target)

    //Remove from Store
    Store.removeCardFromStore(e.target.dataset.id)
})


//Event Display cards onLoad
document.addEventListener("DOMContentLoaded", () => {
    Store.getMode();
})


//Event changeMode onClick
document.querySelector(".light-dark-toggle").addEventListener("click", () => {
    darkMode = localStorage.getItem("darkMode");
    //Következő sor, csak ezzel működik === null csak 2 kattintásig működik
    if (darkMode !== "enabled") {
        Store.enableDarkMode();
    } else {
        Store.disableDarkMode();
    }
})







