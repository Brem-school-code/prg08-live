import './App.css';
import { GoogleLogin } from 'react-google-login'
import axios from 'axios'
import { useState } from 'react';
import { DecisionTree } from "./libraries/decisiontree.js"
import Papa from "papaparse";

let decisionTree;

function App() {

  const [Vak, setVak] = useState('')
  const [Klassen, setKlassen] = useState('')
  const [Docent, setDocent] = useState('')
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [upload, setUpload] = useState(false)
  const [resultaat, setResultaat] = useState('');

  const trainingLabel = "Lokalen"
  const ignored = ["Lnr", "Tijdberijk", "Lestekst", "Regeltekst", "Tijdvak", "Leerlingengroep", "Uurtekst", "lesweken", "ExternUur", "Datum", "Dag", "Uren", "Weekuur", "Begin", "Eindtijd"]

  const trainModel = (data) => {
    data.sort(() => (Math.random() - 0.5))

    let trainData = data.slice(0, Math.floor(data.length * 0.8))

    decisionTree = new DecisionTree({
      ignoredAttributes: ignored,
      trainingSet: trainData,
      categoryAttr: trainingLabel
    })

    setUpload(true);
  }

  const responseGoogle = response => {

        setSignedIn(true)
      
  }

  const responseError = error => {
    console.log(error)
  }


  const handleSubmit = (e) => {
    e.preventDefault()

    let lokaal = {
      Docent,
      Klassen,
      Vak,
    }

    let lokaalPrediction = decisionTree.predict(lokaal)

    if (lokaalPrediction == "NVT" || lokaalPrediction == "null") {
      lokaalPrediction = "Online"
    }

    setResultaat(lokaalPrediction)
  
  }


  return (

    <div id="body">
      <div className="App-header">
        <h1>Air Bender</h1>
        <h2>Uw online roostermaker!</h2>

        {!signedIn ? (
          <div> Log in!</div>
        ) : ("")}
      </div>

      {

        !signedIn ? (<div>
          <p>Log in via Google om een nieuw event in te plannen: </p>
          <div id="GoogleButton">
            <GoogleLogin
              clientId='982315485998-61qb28hgef1dmf709derbnb9nnunt0mu.apps.googleusercontent.com'
              buttonText='Log in met uw Google account'
              onSuccess={responseGoogle}
              onFailure={responseError}
              cookiePolicy={'single_host_origin'}
              responseType='code'
              accessType='offline'
              scope='openid email profile https://www.googleapis.com/auth/calendar'
            /> </div>
        </div>) : (<div id="Form">

          {
            !upload ? (<div> <h2>Upload een rooster bestand voor de AI</h2>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Papa.parse(files[0], {
                      download: true,
                      header: true,
                      dynamicTyping: true,
                      complete: function (results) {
                        trainModel(results.data);
                      }
                    }
                    )
                  }
                }}
              />
            </div>) : (<div>
                  
                  <h2>Plaats een reservering!</h2>

                <form onSubmit={handleSubmit}>
                  <label htmlFor='vak'>Vak</label>
                  <br />
                  <input type="text" id="vak" value={Vak} onChange={e => setVak(e.target.value)} />
                  <br />
  
                  <label htmlFor='klassen'>Klas(sen)</label>
                  <br />
                  <input type="text" id="klassen" value={Klassen} onChange={e => setKlassen(e.target.value)} />
                  <br />
  
                  <label htmlFor='docent'>Docent</label>
                  <br />
                  <input type="text" id="docent" value={Docent} onChange={e => setDocent(e.target.value)} />
                  <br />
  
                  <label htmlFor='startDateTime'>Begin datum en tijd</label>
                  <br />
                  <input type="datetime-local" id="startDateTime" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} />
                  <br />
  
                  <label htmlFor='endDateTime'>Eind datum en tijd</label>
                  <br />
                  <input type="datetime-local" id="endDateTime" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} />
                  <br />
  
                  <button type="submit">Voeg reservering toe</button>
                </form>

                <p>Het lokaal is: {resultaat}</p>

              </div>)}

              



        </div>)
      }







    </div>
  );

}

export default App;
