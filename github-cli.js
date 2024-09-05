#!/usr/bin/env node
const http = require("https");

const username = process.argv.slice(2)[0];

if (!username) {
  console.error("Please provide a GitHub username: github-activity <username>");
  process.exit(1); // Exit the program with error code 1

  /*
  The process.exit() method in Node.js is used to end the process and exit the application. It accepts an optional exit code as its argument. Here’s what it means:
process.exit(0): This indicates a successful exit. By convention, an exit code of 0 signifies that the program completed successfully without errors.
process.exit(1): This indicates an unsuccessful exit or an error. By convention, an exit code of 1 (or any non-zero code) signals that the program encountered an error or did not complete as expected.
In your CLI application, calling process.exit(1) when the username is missing or invalid ensures that the program exits with an error code, which is useful for scripts or other systems that might rely on the exit code to determine if the program ran successfully or encountered a problem. */
}
// GitHub API URL to fetch user events
const url = `https://api.github.com/users/${username}/events`;

// Set up the HTTP request options, including the User-Agent (GitHub API requires this)
const options = {
  headers: {
    "User-Agent": "node.js",
  },
};

async function fetchApi() {
  http.get(url, options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res
      .on("end", async (chunk) => {
        try {
          const events = await JSON.parse(data);
          // Check if there is any activity
          if (events.length === 0) {
            console.log(`${username} has no recent activity.`);
            return;
          }
          if (events?.status === "404") {
            console.error(`Please enter a valid UserName ${username}`);
            process.exit(1); // Exit the program with error code 1
          }
          console.log(events);
          // Loop through the events and display the relevant activity
          events.forEach((event) => {
            switch (event.type) {
              case "PushEvent":
                console.log(
                  `Pushed ${event.payload.commits.length} commits to ${event.repo.name}`
                );
                break;
              case "IssuesEvent":
                console.log(`Opened a new issue in ${event.repo.name}`);
                break;
              case "WatchEvent":
                console.log(`Starred ${event.repo.name}`);
                break;
              // Add more cases for different event types as needed
              default:
                console.log(`Performed ${event.type} in ${event.repo.name}`);
            }
          });
        } catch (error) {
          console.error("Error parsing JSON or processing data:", error);
        }
      })
      .on("error", (err) => {
        console.error("Error with the request:", err.message);
      });
  });
}

fetchApi();
