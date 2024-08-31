### Misc

-   Add an in-app notes section - intended primarily for tracking partial watch progress, but I guess it could be used for other things too.

### Config overhaul (switching from a file to UI/localStorage)

-   Add an area to view your config.
-   Set up a system for saving config elements in localStorage.
    -   This system should be transitory, allowing for saving some config elements in localStorage, but able to respect the config file when a given config element has no UI yet.
-   Implement safety measures to reduce the risk of losing the data:
    -   Add a button to back up all data. (No need to implement a feature to read the backups at this time.)
        -   Store a timestamp whenever a backup is made and prompt to make another if it's been more than a month (or however long).
    -   Switch from localStorage to IndexedDB.
        -   Create a wrapper function that checks for a QuotaExceededError and handles it somehow.
        -   Call navigator.storage.persist() somewhere.
-   Transition from the config file to browser storage, one item at a time. Notes:
    -   Instead of having a retrieveAll parameter, there should be a button to "reset" the channel, making all of its videos visible.
    -   When removing a playlist, there should be an option for whether or not to clear out unwatched videos for that playlist. (No need to implement something to allow clearing out unwatched videos for removed playlists after the fact.)

---

### Backlog

-   Indicate video lengths? (Would require more queries, but they could be cached.)
