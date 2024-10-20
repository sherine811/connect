const postButton = document.getElementById("postButton");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");
const socket = io();
// Function to fetch posts
const fetchPosts = async () => {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    postsContainer.innerHTML = "";
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.innerHTML = `
            <p>${post.desc}</p>
            <button class="comment-button" data-postid="${post._id}">Comment</button>
            <div class="comments">
                ${post.comments.map(comment => `<p>${comment.desc} - <strong>${comment.userId}</strong></p>`).join('')}
            </div>
            <textarea class="comment-input" placeholder="Add a comment..."></textarea>
        `;
        postsContainer.appendChild(postDiv);
    });
};

// Function to create a post
postButton.addEventListener("click", async () => {
    const content = postContent.value;
    if (content) {
        await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ desc: content, userId: "YOUR_USER_ID" }), // Replace with actual user ID
        });
        postContent.value = "";
        fetchPosts();
    }
});

// Handle posting a comment
postsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains('comment-button')) {
        const postId = e.target.getAttribute('data-postid');
        const commentInput = e.target.nextElementSibling;

        const commentDesc = commentInput.value;
        if (commentDesc) {
            await fetch(`/api/posts/${postId}/comment`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "YOUR_USER_ID", desc: commentDesc }),
            });
            commentInput.value = "";
            fetchPosts();  // Refresh post to show new comment
        }
    }
});
document.getElementById("updateProfileButton").addEventListener("click", async () => {
    const bio = document.getElementById("bioInput").value;

    await fetch(`/api/auth/updateProfile/YOUR_USER_ID`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bio, location: "Your Location" }),
    });
    alert("Profile updated");
});

socket.on("receiveNotification", (data) => {
    alert(`${data.message}`);
    // Optionally, show notifications in a UI notification panel
});

// Initial fetch of posts
fetchPosts();
