console.log("Test 1");

$(document).ready(function() {

    // // Firebase information
    // var config = {
    //     apiKey: "AIzaSyAhu_Jaq3JhCE3BJ7wg43DrH7b6FtpZND0",
    //     authDomain: "home-owner-rater.firebaseapp.com",
    //     databaseURL: "https://home-owner-rater.firebaseio.com",
    //     projectId: "home-owner-rater",
    //     storageBucket: "home-owner-rater.appspot.com",
    //     messagingSenderId: "275239062934"
    // };
    // firebase.initializeApp(config);
    // var database = firebase.database();

    // // Testig if we're signed in
    // firebase.auth().onAuthStateChanged(function(user) {
    //     if (user) {
    //         console.log("User logged in");
    //         console.log(user);
    //         currentUser = user.email;
    //     } else {
    //         console.log("Not signed in");
    //     }
    // });

    // Getting jQuery references to the post body, title, form, and author select
    var commentInput = $("#comments");
    var ratingInput = $("#rating");
    var cmsForm = $("#cms");
    var userSelect = sessionStorage.getItem("userID");
    var ownerSelect = $("owner");

    // Adding an event listener for when the form is submitted
    $(document).on("submit", "#owner-form", handleOwnerFormSubmit);
    $(cmsForm).on("submit", handleFormSubmit);

    // Gets the part of the url that comes after the "?" (which we have if we're updating a post)
    var url = window.location.search;
    var postId;
    var authorId;
    var ownerId;

    // Sets a flag for whether or not we're updating a post to be false initially
    var updating = false;

    // If we have this section in our url, we pull out the post id from the url
    // In '?post_id=1', postId is 1
    if (url.indexOf("?post_id=") !== -1) {
        postId = url.split("=")[1];
        getPostData(postId, "post");
    }
    // Otherwise if we have an author_id in our url, preset the author select box to be our Author
    else if (url.indexOf("?user_id=") !== -1) {
        authorId = url.split("=")[1];
    }

    getUsers();
  
    // A function to handle what happens when the form is submitted to create a new Owner
    function handleOwnerFormSubmit(event) {
      event.preventDefault();
      // Don't do anything if the name fields hasn't been filled out
      if (!nameInput.val().trim().trim()) {
        return;
      }
      // Calling the upsertOwner function and passing in the value of the name input
      upsertOwner({
        name: nameInput
          .val()
          .trim()
      });
    }

    // A function for creating an owner. Calls getOwners upon completion
    function upsertOwner(ownerData) {
      $.post("/api/owners", ownerData)
        .then(getOwners);
    }

    // Function for retrieving owners and getting them ready to be rendered to the page
    function getOwners() {
      // $.get("/api/owners", function(data) {
      //   var rowsToAdd = [];
      //   for (var i = 0; i < data.length; i++) {
      //     rowsToAdd.push(createOwnerRow(data[i]));
      //   }
      //   renderOwnerList(rowsToAdd);
      //   nameInput.val("");
      // });

      $.get("/api/owners", renderOwnerList);
    }

    // A function for rendering the list of owners to the page

    // make this like the renderUserList, but why is that one blanked out???
    
    function renderOwnerList(rows) {
      ownerList.children().not(":last").remove();
      ownerContainer.children(".alert").remove();
      if (rows.length) {
        console.log(rows);
        ownerList.prepend(rows);
      }
      // else {
      //   renderEmpty();
      // }
    }

    // A function for handling what happens when the form to create a new post is submitted
    function handleFormSubmit(event) {
        event.preventDefault();
        // Wont submit the post if we are missing a body, title, or author
        if (!ratingInput.val().trim() || !commentInput.val().trim() ) {
            return;
        }
        // Constructing a newPost object to hand to the database
        var newPost = {
            rating: ratingInput
                .val()
                .trim(),
            comment: commentInput
                .val()
                .trim(),
            userId: userSelect
            // ownerId: ownerSelect.val()
        };

        // If we're updating a post run updatePost to update a post
        // Otherwise run submitPost to create a whole new post
        if (updating) {
            newPost.id = postId;
            updatePost(newPost);
        } else {
            submitPost(newPost);
        }
    }

    // Submits a new post and brings user to blog page upon completion
    function submitPost(post) {
        $.post("/api/posts", post, function() {
            window.location.href = "/blog";
        });
    }

    // Gets post data for the current post if we're editing, or if we're adding to an author's existing posts
    function getPostData(id, type) {
        var queryUrl;
        switch (type) {
            case "post":
                queryUrl = "/api/posts/" + id;
                break;
            case "author":
                queryUrl = "/api/users/" + id;
                break;
            default:
                return;
        }
        $.get(queryUrl, function(data) {
            if (data) {
                console.log(data.userId || data.id);
                // If this post exists, prefill our cms forms with its data
                ratingInput.val(data.title);
                commentInput.val(data.body);
                authorId = data.authorId || data.id;
                // If we have a post with this id, set a flag for us to know to update the post
                // when we hit submit
                updating = true;
            }
        });
    }

    // A function to get user and then render our list of users
    function getUsers() {
      $.get("/api/users", renderUserList);
    }
    //Function to either render a list of user, or if there are none, direct the user to the page
    //to create a user first
    function renderUserList(data) {
      if (!userSelect) {
        window.location.href = "/user-manager";

      }
      $(".hidden").removeClass("hidden");
      // var rowsToAdd = [];
      // for (var i = 0; i < data.length; i++) {
      //   rowsToAdd.push(createUserRow(data[i]));

      // }
      // userSelect.empty();
      // console.log(rowsToAdd);
      // console.log(userSelect);
      // userSelect.append(rowsToAdd);
      // userSelect.val(authorId);
    }

    // Creates the author options in the dropdown
    function createUserRow(user) {

      var listOption = $("<option>");
      listOption.attr("value", user.id);
      listOption.text(user.name);
      return listOption;
    }

    // Update a given post, bring user to the blog page when done
    function updatePost(post) {
        $.ajax({
                method: "PUT",
                url: "/api/posts",
                data: post
            })
            .done(function() {
                window.location.href = "/blog";
            });
    }
});