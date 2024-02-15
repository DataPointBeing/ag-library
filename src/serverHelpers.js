import {useEffect, useRef, useState} from "react";

export function toggleRead(isbn, newVal) {
   fetch("http://localhost:8080/updatebook", {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify({
         user: localStorage.getItem("theca-user"),
         isbn: isbn,
         key: "finished",
         newValue: newVal
      })
   }).catch((err) =>
      console.error(err)
   );
}

export function removeBook(isbn) {
   fetch("http://localhost:8080/removebook", {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify({
         user: localStorage.getItem("theca-user"),
         isbn: isbn
      })
   }).catch((err) =>
      console.error(err)
   );
}

export function insertBook(isbn) {
   fetch("http://localhost:8080/addbook", {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify({
         user: localStorage.getItem("theca-user"),
         isbn: isbn
      })
   }).catch((err) =>
      console.error(err)
   );
}

export async function submitUsername(uN) {
   return await fetch("http://localhost:8080/whosthere", {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify({
         user: uN
      })
   }).then(res => res.json()).then(jsn => jsn.result).catch((err) =>
      console.error(err)
   );
}

export function useThecaAuth() {
   return useRef(localStorage.getItem("theca-user"));
}

export function useBooksList() {
   const [fetchResult, setFetchResult] = useState([]);
   const who = useThecaAuth().current;

   useEffect(() => {
      if(who) {
         fetch("http://localhost:8080/getbooks", {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
            },
            body: JSON.stringify({
               user: who
            })
         }).then(
            res => res.json()
         ).then(
            jsn => {
               setFetchResult(jsn)
            }
         ).catch((err) =>
            console.error(err)
         );
      }
   }, [who]);

   return fetchResult;
}

export function useOpenLibraryEntries() {
   const [fetchResult, setFetchResult] = useState({list: []});
   const books = useBooksList();

   useEffect(() => {
      if(books && books.length > 0) {

         for (const book of books) {
            if(book["isbn"] && book["isbn"].length > 0) {
               const detailedEntry = {};
               Object.assign(detailedEntry, book);
               //console.log(book["isbn"])
               fetch("https://openlibrary.org/isbn/" + book["isbn"] + ".json", {
                  method: 'GET',
                  headers: {
                     'Accept': 'application/json'
                  }
               }).then(
                  res => res.json()
               ).then(
                  async jsn => {
                     let authorString = "";
                     if(jsn["authors"]) {
                        await fetch("https://openlibrary.org" + jsn["authors"][0]["key"] + ".json", {
                           method: 'GET',
                           headers: {
                              'Accept': 'application/json'
                           }
                        }).then(
                           res => res.json()
                        ).then(
                           res => {
                              authorString = res["name"];
                              if (jsn["authors"].length > 1) {
                                 authorString += "& " + (jsn["authors"].length - 1) + " other(s)";
                              }
                           }
                        ).catch((err) =>
                           console.error(err)
                        );
                     }



                     detailedEntry["author"] = authorString;
                     detailedEntry["title"] = jsn["title"];
                     detailedEntry["year"] = jsn["publish_date"];
                     detailedEntry["pages"] = jsn["number_of_pages"];
                     detailedEntry["cover"] = "https://covers.openlibrary.org/b/isbn/" + book["isbn"] + "-M.jpg";
                     setFetchResult(state => ({list: [...state.list, detailedEntry]}))
                  }
               ).catch((err) => {
                     console.error(err);
                     setFetchResult(state => ({list: [...state.list, book]}));
                  }
               );
            }
            else {
               setFetchResult(state => ({list: [...state.list, book]}))
            }
         }
      }
   }, [books]);

   return fetchResult;
}