// add error-handling
// Add filter
// Add a way to select the book you wish to edit/remove, and show its data on the right-hand window.
window.addEventListener("load", () => {
    let key = "";
    let titleField = document.getElementById("addTitle");
    let authorField = document.getElementById("addAuthor");
    let books = document.getElementById("bookList");
    let selBook = document.getElementById("delBook");
    let keyBtn = document.getElementById("keyBtn");
    let addBtn = document.getElementById("addBtn");
    let updateBtn = document.getElementById("updateBtn");
    let delBtn = document.getElementById("delBtn");
    let editBtn = document.getElementById("editBtn");
    keyBtn.onclick = () => requestKey();
    addBtn.onclick = () => addBook();
    updateBtn.onclick = () => getAllBooks();

    function queryDatabase(query, action) {
        let retryCount = 0;
        let url = "https://www.forverkliga.se/JavaScript/api/crud.php?" + query;

        function beginQuery() {
            retryCount += 1
            let statusMessage = "after " + retryCount + " attempt(s).";
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    statusParagraph = document.getElementById("status");
                    if (data.status == "success") {
                        statusParagraph.innerHTML = "Query success " + statusMessage;
                        statusParagraph.style.color = "green";
                        action(data);
                    }
                    else if (retryCount < 10) {
                        beginQuery();
                    }
                    else {
                        statusParagraph.innerHTML = "Query failed " + statusMessage + "<br />" + data.message;
                        statusParagraph.style.color = "red";
                    }
                }); 
        }

        beginQuery();
    }

    function requestKey() {
        let queryString = "requestKey";
        queryDatabase(queryString, (data) => {
            key = "&key=" + data.key;
            document.getElementById("keyTxt").innerHTML = "Current Key: " + data.key;
        });
    }

    function addBook() {
        let title = titleField.value;
        let author = authorField.value;
        let queryString = "op=insert" + key + "&title=" + title + "&author=" + author;
        queryDatabase(queryString, (data) => {

        });
    }

    function getAllBooks() { 
        let queryString = "op=select" + key;
        queryDatabase(queryString, (data) => {
            for (var i = 0; i < data.data.length; i++) {
                let node = document.createElement("li");
                node.id = data.data[i].id;
                node.innerHTML =
                    "ID: " + data.data[i].id + "<br />" +
                    "Title: " + data.data[i].title + "<br />" +
                    "Author: " + data.data[i].author + "<br />" +
                    "Last updated: " + data.data[i].updated;
                books.appendChild(node);
            }
        });
    }

});