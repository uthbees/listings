# Listings for YouTube

### Warning

This project should not be hosted publicly - there are API key issues that would need to be resolved for that to work (see the section at the bottom for details).

### Setup

Other than cloning/installing/building/etc., you'll need to set up your configuration. Create duplicates of the .example files in public and src/config (and remove the .example extensions) and fill in the blanks - your YouTube API key and your desired list of channels and playlists. (You'll be able to edit public/config.js after building the application, but the API key gets built in.)

### Configuring playlists

To run, the program requires a list of playlist IDs that you'll need to supply manually by going to the YouTube website and - in most cases - copying it from the URL.

#### Normal playlists

Go to the page for the playlist (or a page playing the playlist) and look at the URL - you should see a parameter called `list` with a string of numbers, letters, and maybe symbols. Copy and paste that into the playlists array.

#### Channel playlists

YouTube has a feature where it creates an auto-generated playlist for each user containing every public video on their channel. If the user you want the list for has a "Videos" row on their front page, you should be able to click on the "Play all" button to access the list, at which point you can get the ID as normal.

If the user doesn't have that row on their front page, you can still get to the list, it's just a little more effort. Open the inspector or view the page source and look for their channel ID - it should be in the HTML somewhere. You're looking for a string starting with "UC". Once you find it, replace that "UC" at the beginning with "UULF", and you should have the id for the list of all the user's videos. If you want to test it, go to the page for any other playlist and substitute the list ID in the URL - it should work without any problems.

### Other features

#### Getting all the videos from a playlist

In some cases, you may want to get all the videos from a given playlist or channel, not just the most recent ones. For these cases, you can set the `retrieveAll` parameter for the playlist to `true` in your config file.

#### Listing individual videos

To add individual videos to your list, put the video IDs into an array at `exportedConfig.requests.videos`.

#### Extra configuration

For further configuration options, use the object at `exportedConfig.options`. Here are the available fields:

-   `useWeeklyRefresh` (boolean): If true, will "release" (start displaying) newly published videos once a week, instead of immediately. This can be helpful to avoid feeling like you have to check back all the time.
    -   `weeklyRefreshDay` (int between 0 and 6): The day to trigger the refresh, with 0 being Sunday. Defaults to 0.
    -   `weeklyRefreshHour` (int between 0 and 23): The hour to trigger the refresh, with 0 being midnight. Defaults to 0.
-   `invertSortDirection` (boolean): If true, switches the sort direction from putting the oldest videos at the top to putting the newest videos at the top.

### Problems with hosting publicly

For public hosting to work, we would either need every user to provide their own YouTube API key, or we would need to get a backend so that the client never sees the API key at all. (Caution - letting other people use your API key has security implications, especially if you haven't restricted it!)
