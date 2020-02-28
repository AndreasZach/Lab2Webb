window.addEventListener("load", () => {
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

    // Adds the query parameter to the baseURL for the website. Then uses the Action parameter to execute the appropriate code for that query.
    // The function will retry up to ten times before informing the user of query failure, as well as the error message attached to it.
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
                        defaultState()
                    }
                })
                .catch((err) => window.alert(err));
        }
        beginQuery();
    }

    function requestKey() {
        disableElements([keyBtn]);
        clearBookView();
        let queryString = "requestKey";
        queryDatabase(queryString, (data) => {
            key = "&key=" + data.key;
            document.getElementById("keyTxt").innerHTML = data.key;
        });
    }

    function addBook() {
        disableElements([addBtn]);
        if (!titleField.value || !titleField.value.trim()) {
            defaultState();
            return window.alert("Please enter a Title for the book.");
        }
        if (!authorField.value || !authorField.value.trim()) {
            defaultState();
            return window.alert("Please enter an Author for the book.");
        }
        if (detectEmoji(titleField.value + " " + authorField.value)) {
            defaultState();
            return window.alert("Emoji Unicode patterns are not valid inputs");
        }

        let queryString = "op=insert" + key + "&title=" + titleField.value + "&author=" + authorField.value;
        queryDatabase(queryString, (data) => {
            titleField.value = "";
            authorField.value = "";
        });
    }

    function getBooks() {
        disableElements([updateBtn]);
        if (bookView.children.length > 0) {
            clearBookView();
        }
        let queryString = "op=select" + key;

        // For each item received, it creates a unordered list element, one list element for each property of the object received from the server and their data in textnodes.
        // It then appends each textNode to it's appropriate parent, before appending each parent to the main ul node.
        // Finally, it appends the ul to the bookView list.
        queryDatabase(queryString, (data) => {
            data.data.forEach((item) => {
                let innerUl = document.createElement("ul");
                let idNode = document.createElement("li");
                let titleNode = document.createElement("li");
                let authorNode = document.createElement("li");
                let updatedNode = document.createElement("li");
                idNode.appendChild(document.createTextNode(item.id));
                idNode.className = "id";
                titleNode.appendChild(document.createTextNode(item.title));
                titleNode.className = "title";
                authorNode.appendChild(document.createTextNode(item.author));
                authorNode.className = "author";
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
            return window.alert("Must select a book before you can delete it.")
        }
        else {
            let queryString = "op=delete" + key + "&id=" + selectedBook.id;
            queryDatabase(queryString, (data) => {
                document.getElementById(selectedBook.id).remove();
                selectedBook = null;
            })
        }
    }


    // Enters the "edit state" by disabling all input elements which are not needed, or could hinder the editing.
    function beginEdit() {
        if (selectedBook == null || selectedBook == undefined) {
            return window.alert("Must select a book before you can edit it.")
        }
        else {
            editState();
        }
    }

    // finishes the editing then exits the "edit state" and replaces it with the default state.
    function confirmEdit() {
        let editTitle = document.getElementById("editTitle");
        let editAuthor = document.getElementById("editAuthor");
        if (editTitle.value.trim().length <= 1 || editAuthor.value.trim().length <= 1) {
            return window.alert("Author and Title must contain two or more characters.");
        }
        else {
            let queryString = "op=update" + key + "&id=" + selectedBook.id + "&title=" + editTitle.value + "&author=" + editAuthor.value;
            queryDatabase(queryString, (data) => {
                selectedBook.children[1].innerHTML = editTitle.value;
                selectedBook.children[2].innerHTML = editAuthor.value;
            });
        }
    }

    function clearBookView() {
        bookView.innerHTML = "";
        selectedBook = null;
    }

    function detectEmoji(text){
        let ranges = [
            "\ud83c[\udf00-\udfff]",
            "\ud83d[\udc00-\ude4f]",
            "\ud83d[\ude80-\udeff]"
        ];
        return text.match(new RegExp(ranges.join('|')));
    }

    function disableElements(elements) {
        elements.forEach(element => element.disabled = true)
    }

    function enableElements(elements) {
        elements.forEach(element => element.disabled = false)
    }

    function editState() {
        selTitle.innerHTML = "<input id='editTitle' type='text' value='" + selectedBook.children[1].innerText + "' />"
        selAuthor.innerHTML = "<input id='editAuthor' type='text' value='" + selectedBook.children[2].innerText + "' />"
        editBtn.style.display = "none";
        confirmEditBtn.style.display = "block";
        disableElements([addBtn, delBtn, updateBtn, keyBtn]);
        enableElements([keyBtn]);
    }

    function defaultState() {
        if (selectedBook == undefined || selectedBook == null) {
            disableElements([delBtn, editBtn]);
            selId.innerHTML = null;
            selTitle.innerHTML = null;
            selAuthor.innerHTML = null;
            selUpdated.innerHTML = null;
        }
        else {
            selTitle.innerHTML = selectedBook.children[1].innerHTML;
            selAuthor.innerHTML = selectedBook.children[2].innerHTML;
            enableElements([editBtn, delBtn])
        }
        editBtn.style.display = "block";
        confirmEditBtn.style.display = "none";
        enableElements([addBtn, updateBtn, keyBtn]);
    }
});