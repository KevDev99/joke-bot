import React,{useState, useEffect} from 'react';
import './App.css';

/** Assets */
import Joker from './favicon.svg';
import Twitter from './assets/icons/twitter.png';
import Github from './assets/icons/github.png';

function App() {

  // Import the Web Speech API
  // More Informations: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
  const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
      const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;  
      const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
  const recognition = new SpeechRecognition();
      const speechRecognitionList = new SpeechGrammarList();
      
  
  const [isLoading, setIsLoading] = useState(false);
  const [jokeQuestion, setJokeQuestion] = useState(null);
  const [joke, setJoke] = useState(null);
  const [languageCode, setLanguageCode] = useState("en");
  const [errMessage, setErrMessage] = useState(null);

  
  useEffect(() => {
    // get joke when the user presses the key 'j'
    window.addEventListener('keypress', e => {
      if(e.key === "j") {
        getJoke();
      }
    });

    // start voice regonition via Web Speech API to react to voice inputs
    // when the user says 'Tell me a joke ' -> get a joke
    window.addEventListener('load', () => {
      recognition.start();
      recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        if(text === "Tell me a joke.") {
          getJoke();
        }
      }
    })
  }, []);


  const getJoke = async () => {

    // clear err messsage and start loading
    setErrMessage(null)
    setIsLoading(true);
    setJokeQuestion(null)
    setJoke(null)
    
    const res = await fetch(`https://v2.jokeapi.dev/joke/Dark?lang=${languageCode}`);
    const data = await res.json();
    
    setIsLoading(false);

    // check if type is twopart or single
    if(data.type === "twopart") {
      setJokeQuestion(data.setup);

      // read text with WebSpeech API
      const jokeQuestionSpeech = new SpeechSynthesisUtterance(data.setup);
      jokeQuestionSpeech.lang= languageCode;
      window.speechSynthesis.speak(jokeQuestionSpeech);
      setTimeout(() => {
        
        setJoke(data.delivery)
        const jokeSpeech = new SpeechSynthesisUtterance(data.delivery);
        jokeSpeech.lang= languageCode;
      window.speechSynthesis.speak(jokeSpeech);
      }, 4000)
    } 

    if(data.type === "single") {
      setJoke(data.joke)
      setJokeQuestion(null);
      const jokeSpeech = new SpeechSynthesisUtterance(data.joke);
        jokeSpeech.lang= languageCode;
      window.speechSynthesis.speak(jokeSpeech);
    }

    if(data.error === true) {
      let errorMessage = data.message;
      // err code 106 means there is no joke available for this language
      if(data.code === 106) {
        errorMessage +=  " - Language not supported. Use another one."
      }
      setErrMessage(errorMessage)
    }    
  }  
  
  
  return (
    <> 
    <header>
      <div className="logo">
        <h1>JokerJokes</h1>
        <span>DARK HUMOUR!</span>
      </div>
      <div className="language">
        <span>Language: </span>
        <select onChange={(e) => setLanguageCode(e.target.value)}>
          <option value="en">en - English</option>
          <option value="de">de - German</option>
          <option value="cs">cs - Czech</option>
          <option value="es">es - Spanish</option>
          <option value="fr">fr - French</option>
          <option value="pt">pt - Protuguese</option>
        </select>
      </div>
      <div className="socialbar">
        <a className="social-link" href="https://twitter.com/kevin_taufer" target="_blank" >
          <img src={Twitter} />
        </a>
        <a className="social-link" href="https://github.com/KevDev99" target="_blank">
          <img src={Github} />
        </a>
      </div>    
    </header>
    <main >
      <div className="flex d-col jc-center al-center">
        <img className="joker-img" src={Joker} />
         <button onClick={getJoke}  className="joker-btn">Tell me a joke</button>

        <div className="joke-container">
          {jokeQuestion && <h2 className="fade-in joke-text">{jokeQuestion}  </h2> }
           {joke && <h2 className=" joke-text">
            {joke}
          </h2> }
          {errMessage && <h2 className="err-text">
            {errMessage}
          </h2>}
        </div>
        {isLoading && <div className="col-3">
        <div className="snippet" data-title=".dot-flashing">
          <div className="stage">
            <div className="dot-flashing"></div>
          </div>
        </div>
      </div>}
      </div>   

      
    </main>
    <footer>
      Kevin Taufer © {new Date().getFullYear()     }
    </footer>
    </>
  );
}

export default App;