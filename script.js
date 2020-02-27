
// Add filter
// Clean the code

// add books one by one when you create them, or get them all at once with a method?
// create a function to disable/enable elements that you pass into it as paramenters?

let key = "";
let titleField = document.getElementById("addTitle");
let authorField = document.getElementById("addAuthor");
let bookView = document.getElementById("bookList");
let keyBtn = document.getElementById("keyBtn");
let addBtn = document.getElementById("addBtn");
let updateBtn = document.getElementById("updateBtn");
let delBtn = document.getElementById("delBtn");
let editBtn = document.getElementById("editBtn");
let confirmEditBtn = document.getElementById("confirmEditBtn");
let selId = document.getElementById("selId");
let selTitle = document.getElementById("selTitle");
let selAuthor = document.getElementById("selAuthor");
let selUpdated = document.getElementById("selUpdated");
let selectedBook = null;
keyBtn.onclick = requestKey;
addBtn.onclick = addBook;
updateBtn.onclick = getBooks;
delBtn.onclick = deleteBook;
editBtn.onclick = beginEdit;
confirmEditBtn.onclick = confirmEdit;

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
                    defaultState()
                }
                else if (retryCount < 10) {
                    beginQuery();
                }
                else {
                    statusParagraph.innerHTML = "Query failed " + statusMessage + "<br />" + data.message;
                    statusParagraph.style.color = "red";
                }
            })
            .catch((err) => window.alert(err));
    }

    beginQuery();
}

function requestKey() {
    let queryString = "requestKey";
    queryDatabase(queryString, (data) => {
        key = "&key=" + data.key;
        document.getElementById("keyTxt").innerHTML = data.key;
    });
}

function addBook() {
    if (!titleField.value || !titleField.value.trim()) {
        return window.alert("Please enter a Title for the book.");
    }
    if (!authorField.value || !authorField.value.trim()) {
        return window.alert("Please enter an Authoe for the book.");
    }
    let queryString = "op=insert" + key + "&title=" + titleField.value + "&author=" + authorField.value;
    queryDatabase(queryString, (data) => {
        titleField.value = "";
        authorField.value = "";
    });
}

function getBooks() {
    if (bookView.children.length > 0) {
        bookView.innerHTML = "";
    }
    selectedBook = null;
    let queryString = "op=select" + key;
    queryDatabase(queryString, (data) => {
        data.data.forEach((item) => {

            let innerUl = document.createElement("ul");

            let idNode = document.createElement("li");
            idNode.appendChild(document.createTextNode(item.id));
            idNode.className = "id";
            let titleNode = document.createElement("li");
            titleNode.appendChild(document.createTextNode(item.title));
            titleNode.className = "title";
            let authorNode = document.createElement("li");
            authorNode.appendChild(document.createTextNode(item.author));
            authorNode.className = "author";
            let updatedNode = document.createElement("li");
            updatedNode.appendChild(document.createTextNode(item.updated));
            updatedNode.className = "updated";

            innerUl.appendChild(idNode);
            innerUl.appendChild(titleNode);
            innerUl.appendChild(authorNode);
            innerUl.appendChild(updatedNode);
            innerUl.id = item.id;
            innerUl.onclick = selectBook;
            bookView.appendChild(innerUl);
        });
    });
}
// manipulate book? put all these function inside a closure
function selectBook() {
    selectedBook = this;
    selId.innerHTML = this.children[0].innerText;
    selTitle.innerHTML = this.children[1].innerText;
    selAuthor.innerHTML = this.children[2].innerText;
    selUpdated.innerHTML = this.children[3].innerText;
    defaultState();
}

function deleteBook() {
    if (!selectedBook) {
        window.alert("Must select a book before you can delete it...")
    }
    else {
        let queryString = "op=delete" + key + "&id=" + selectedBook.id;
        queryDatabase(queryString, (data) => {
            document.getElementById(selectedBook.id).remove();
            selectedBook = null;
        })
    }
}

function beginEdit() {
    if (selectedBook == null || selectedBook == undefined) {
        return window.alert("Must select a book before you can edit it...")
    }
    else {
        editState();
    }
}

function confirmEdit() {
    let editTitle = document.getElementById("editTitle");
    let editAuthor = document.getElementById("editAuthor");
    if (editTitle.value.trim().length <= 1 || editAuthor.value.trim().length <= 1) {
        window.alert("Cannot set an Author or Title to null");
    }
    else {
        let queryString = "op=update" + key + "&id=" + selectedBook.id + "&title=" + editTitle.value + "&author=" + editAuthor.value;
        queryDatabase(queryString, (data) => {
            selectedBook.children[1].innerHTML = editTitle.value;
            selectedBook.children[2].innerHTML = editAuthor.value;
        })
    }

}

function noKeyState() {
    editBtn.disabled = true;
    addBtn.disabled = true;
    delBtn.disabled = true;
    updateBtn.disabled = true;
    keyBtn.disabled = false;
}

function editState() {
    selTitle.innerHTML = "<input id='editTitle' type='text' value='" + selectedBook.children[1].innerText + "' />"
    selAuthor.innerHTML = "<input id='editAuthor' type='text' value='" + selectedBook.children[2].innerText + "' />"
    editBtn.style.display = "none";
    confirmEditBtn.style.display = "block";
    addBtn.disabled = true;
    delBtn.disabled = true;
    updateBtn.disabled = true;
    keyBtn.disabled = true;
}

function defaultState() {

    if (selectedBook == undefined || selectedBook == null) {
        editBtn.disabled = true;
        delBtn.disabled = true;
        selId.innerHTML = null;
        selTitle.innerHTML = null;
        selAuthor.innerHTML = null;
        selUpdated.innerHTML = null;
    }
    else {
        selTitle.innerHTML = selectedBook.children[1].innerHTML;
        selAuthor.innerHTML = selectedBook.children[2].innerHTML;
        editBtn.disabled = false;
        delBtn.disabled = false;
    }

    editBtn.style.display = "block";
    confirmEditBtn.style.display = "none";
    addBtn.disabled = false;
    updateBtn.disabled = false;
    keyBtn.disabled = false;
}