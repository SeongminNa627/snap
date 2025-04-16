/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * 
 * Author: Seongmin Na
 * Date: 4.15.2025
 * Description:
 * This program allows users to find synonyms of the word when given one. When given two words,
 * it shows how related are those entries.
 */



let WORDS = [];
let winStart = 0;
let winEnd = 4;
let synonymCards = []
function showCards() {
  const cardContainer = document.getElementById("card-container");
  const firstInput = document.getElementById("first_search");
  let firstWords = firstInput.value;
  const secondInput = document.getElementById("second_search");
  let secondWords = secondInput.value;
  

  if ((!firstWords && !secondWords)){
    alert("Type any word to find synonyms!")
  }
  //Only one word was provided. Provide synonyms of the word.
  else if (!(firstWords && secondWords)){
    let label = document.getElementById("lb");
    label.style.display = "block";
    if (firstWords && !secondWords && invalidWordAlert(firstWords.toLowerCase())){
      synonymCards = findSynonymsCards(firstWords);
    }
    else if(!firstWords && secondWords && invalidWordAlert(secondWords.toLowerCase())){

      synonymCards = findSynonymsCards(secondWords);
    }
    populateCards(cardContainer, synonymCards, winStart, winEnd);

  }
  
  //Two words were provided. Similarity analysis.
  else if (firstWords && secondWords&& invalidWordAlert(firstWords.toLowerCase())&& invalidWordAlert(secondWords.toLowerCase())){
    let label = document.getElementById("lb");
    label.style.display = "none";
    let simCard = compareTwoWordsCard(firstWords, secondWords);
    let arithCard = arithmaticCard(firstWords,secondWords);

    populateCards(cardContainer, [simCard, arithCard], 0, 2);
    
  }


  
}

//Traverse down the list of synonym cards.
function nextCard(){
  console.log("gets called");
  const cardContainer = document.getElementById("card-container");
  if (winEnd < synonymCards.length){
    winStart +=1;
    winEnd +=1;
    populateCards(cardContainer, synonymCards, winStart, winEnd);
  }
}
//Traverse down the list of synonym cards.
function prevCard(){
  const cardContainer = document.getElementById("card-container");
  console.log("prev called");
  if (winStart > 0){
    winStart -= 1;
    winEnd -=1;
    populateCards(cardContainer, synonymCards, winStart, winEnd);
  }
}

//Display the passed in array of cards.
function populateCards(cardContainer,cards, start, end){
  cardContainer.innerHTML = ""
  for (let i = start; i < end;i++){
    cardContainer.appendChild(cards[i]);
  }
}


//Return a card with info related to the sum of the two vectors.
function arithmaticCard(firstWords, secondWords){
  const cardContainer = document.getElementById("card-container");
  const templateCard = document.querySelector(".card");
  let nextCard = templateCard.cloneNode(true); 
  editCardContent(nextCard, "In Our Vocabulary...", ""); // Edit title and paragraph



  first_embedding = getEmbeddings(firstWords.toLowerCase());
  second_embedding = getEmbeddings(secondWords.toLowerCase());


  //+ operation
  listItems = nextCard.querySelectorAll('li'); // grabs all 3 bullet points
  let sumResult = elementWiseAddition([first_embedding, second_embedding]);
  let similarSumWords = Object.keys(similarityTable(sumResult));

  //- operation
  let subResult = elementWiseAddition([first_embedding, second_embedding.map(element => element * -1)]);
  let similarSubWords = Object.keys(similarityTable(subResult));

  listItems[0].textContent = firstWords +" + "+ secondWords + " = " + similarSumWords[2];
  listItems[1].textContent = firstWords +" - "+ secondWords + " = " + similarSubWords[2];
  listItems[1].style.display = "list-item";
  return nextCard
}

function findSynonymsCards(word){
    let input_word = word.toLowerCase()
    const templateCard = document.querySelector(".card");

    let label = document.querySelector('label');
    label.textContent = "Synonyms of the word, " + "\"" + word + "\"", ":" ;

    let word_embedding = getEmbeddings(input_word);
    let synonyms = similarityTable(word_embedding);

    let cards = []
    for (let i = 1; i < 50; i++) {
      let synWord = Object.keys(synonyms)[i]

      const nextCard = templateCard.cloneNode(true); // Copy the template card
      editCardContent(nextCard, "\"" + synWord + "\"", ""); // Edit title
      const listItems = nextCard.querySelectorAll('li');
      listItems[0].textContent = "Similarity: " + Math.round(synonyms[synWord]* 10000)/100 + "%";
      listItems[1].style.display = "none";
      listItems[2].style.display = "none";

      cards.push(nextCard)// Add new card to the container
    }
    return cards
}

function compareTwoWordsCard(word1, word2){
  const templateCard = document.querySelector(".card");
  let nextCard = templateCard.cloneNode(true); // Copy the template card
  let vec1 = getEmbeddings(word1.toLowerCase());
  let vec2 = getEmbeddings(word2.toLowerCase());
  let similarity = cosineSimilarity(vec1, vec2) * 100

  let text = ""
  if (similarity > 60){
    text = "They are similar words!"
  }
  else if (similarity < 30){
    text = "They are not similar!"
  }
  else{
    text = "They are somewhat related."
  }
  let listItems = nextCard.querySelectorAll('li'); // grabs all 3 bullet points
  listItems[0].textContent = text;
  listItems[1].style.display = 'none';
  listItems[2].style.display = 'none';
  
  editCardContent(nextCard, "\"" + word1 + "\"" + " vs " + "\"" + word2 + "\"", "Similarity: " + similarity + "%"); // Edit title and paragraph
  return nextCard
  
}

function invalidWordAlert(word){
  if (!(WORDS.includes(word))){
    alert("Oops! the word "  + "\"" + word + "\"" + " does not exist. Try a different word!")
    return false
  } 
  return true
}


function editCardContent(card, newTitle, passage) {
  card.style.display = "block";

  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = newTitle;

  const cardP = card.querySelector("p");
  cardP.textContent = passage


}


function getEmbeddings(word){
  return EMBEDDINGS[word];
}


function dotProduct(vec1, vec2){
  let res = 0;
  for (let i = 0; i< vec1.length; i ++){
    res += vec1[i] * vec2[i];
  }
  return res
}


function norm(vec){
  return Math.sqrt(vec.reduce((x,y) => x + y*y, 0))
}

function cosineSimilarity(vec1, vec2){
  return dotProduct(vec1, vec2) / (norm(vec1) * norm(vec2))
}

function similarityTable(vec){
  let res = {}
  for (const word in EMBEDDINGS){
      res[word] = cosineSimilarity(vec, EMBEDDINGS[word]);
  }
  res = Object.fromEntries(Object.entries(res).sort(([,a], [,b]) => b -a));
  return res
}


function parse(words){
  return words.split(" ");
}
//can
function elementWiseAddition(arrOfVecs){
  const numVecs = arrOfVecs.length;
  let resultingVec = [];
  let dim = arrOfVecs[0].length;
  for(let i = 0; i < dim; i ++ ){
    let accumulator = 0;
    for (let j = 0; j < numVecs; j ++){
      accumulator = accumulator +  arrOfVecs[j][i];
    }
    
    resultingVec[i] = accumulator;
  }
  return resultingVec;

}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof EMBEDDINGS !== "undefined") {
    WORDS = Object.keys(EMBEDDINGS);
    console.log("WORDS[0]:", WORDS[0]);
  } else {
    console.warn("EMBEDDINGS not found");
  }

});


















