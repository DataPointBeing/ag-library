import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {insertBook, removeBook, submitUsername, toggleRead, useOpenLibraryEntries, useThecaAuth} from "./serverHelpers";

function LibraryHeader() {
   return (
      <div className="Library-Row mobile-no">
         <div>
            Cover
         </div>
         <div>
            Title
         </div>
         <div>
            Author
         </div>
         <div>
            Published
         </div>
         <div>
            No. Pages
         </div>
         <div>
            ISBN
         </div>
         <div>
            Finished reading?
         </div>
         <div>

         </div>
      </div>
   );
}

function LibraryEntry({dbEntry}) {
   function handleReadToggle(e) {
      toggleRead(dbEntry["isbn"], e.currentTarget.checked);
   }

   function handleDeletion(e) {
      removeBook(dbEntry["isbn"], e.currentTarget.checked);
      window.location.reload();
   }

   return (
      <div className="Library-Row">
         <div>
            <img width="80px" src={dbEntry["cover"]} alt={"Cover of " + dbEntry["title"]}/>
         </div>
         <div>
            {dbEntry["title"]}
         </div>
         <div>
            {dbEntry["author"]}
         </div>
         <div>
            {dbEntry["year"]}
         </div>
         <div>
            {dbEntry["pages"]}
         </div>
         <div>
            {dbEntry["isbn"]}
         </div>
         <div>
            <input type="checkbox" className="has-read" defaultChecked={dbEntry["finished"]} onChange={handleReadToggle}/>
         </div>
         <div>
            <i className="bi bi-trash3-fill" onClick={handleDeletion}></i>
         </div>
      </div>
   );
}

function Spreadsheet() {
   const entries = [];
   const dbEntries = useOpenLibraryEntries().list;

   function doAddBook(ev) {
      ev.preventDefault();

      console.log(ev.target);

      insertBook(document.getElementById('scanner-input').value.replace(/\s/g, '').replace(/-/g,""));

      window.location.reload();
   }

   for(const dbEntry of dbEntries) {
      entries.push(<LibraryEntry dbEntry={dbEntry} key={dbEntry._id}/>);
   }

   return (
      <div className="Library-Spreadsheet">
         <LibraryHeader/>
         <div className="Library-Body">
            {entries}
         </div>
         <form onSubmit={doAddBook}>
            <input id="scanner-input"/>
         </form>
      </div>
   );
}

function Login() {
   const [username, setUsername] = useState("");
   const [denyFx, setDenyFx] = useState(false);

   function doSubmit(ev) {
      ev.preventDefault();

      submitUsername(username).then(res => {
         if(res === "ok") {
            localStorage.setItem("theca-user", username);
            window.location.reload();
         }
         else {
            setDenyFx(true);
            setTimeout(function() {
               setDenyFx(false);
            }, 500);
         }
      });
   }

   let inputStyle = {};
   if(denyFx) {
      inputStyle.backgroundColor = "red";
   }

   return <form onSubmit={doSubmit}>
      Who's there?
      <input type="text" onChange={e => setUsername(e.target.value)} style={inputStyle}/>
   </form>
}

function App() {
   const user = useThecaAuth();

   useEffect(() => {
      const scanIn = document.getElementById("scanner-input");
      if(scanIn) {
         scanIn.focus();
      }
   }, []);

   if(user.current == null) {
      return (
         <div className="App">
            <header className="App-header">
               <h1><span>La Bibliotheca</span></h1>
               <Login/>
               <div className="charlies-foot"/>
            </header>
         </div>
      );
   }

   return (
      <div className="App">
         <header className="App-header">
            <h1><span>La Bibliotheca</span></h1>
            <Spreadsheet/>
            <div className="charlies-foot">
               charlie has a foot fetish lol
               <hr/>
            </div>
         </header>
      </div>
   );
}

export default App;
