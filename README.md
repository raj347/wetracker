
![Screenshot](http://pgregory.github.io/wetracker/images/screenshot.png)

WeTracker is a project to create an online, collaborative music creation suite.
The interface is designed to be flexible and configurable, using
[gridstack.js](https://github.com/troolee/gridstack.js) for layout, which
allows an infinite amount of configuration, place your widgets in any location you
like, instead of being constrained to the typical docker style interface. The
screenshot above shows the current, work-in-progress, 
[tracker](https://en.wikipedia.org/wiki/Music_tracker) style interface, this is
just one of the planned methods for editing music, others will follow, including
a more traditional horizontal style. The underlying music framework is able to 
support multiple visual representations.

The project will ultimately allow collaborative editing at varyious levels,
including live interactive editing by multiple users, and turn based non-realtime
music creation.

WeTracker is very early in development, I welcome ideas and suggestions, and of course
any contributions.

```
npm install
npm run start
```
Visit the [website](https://pgregory.github.io/wetracker/) for more up to date information 
and semi-regular blog updates.

The current development status is deployed to Heroku for you to tinker with. 

[https://wetracker.herokuapp.com/](https://wetracker.herokuapp.com/)

Basic operation: It starts with an empty song, one pattern and a couple of sample instruments. There is
currently no way to create new patterns or songs. You can make any changes you like to the pattern, the 
keyboard is normal Fasttracker style, 
```
  Z,X,C,V,B,N,M = C,D,E,F,G,A,B 
  S,D = C#, D#
  G,H,J = F#, G#, A#
  Q,W,E,R,T,Y,U = C,D,E,F,G,A,B one octave up
  2,3 = C#, D# one octave up
  5,6,7 = F#, G#, A# one octave up
  
  0-9 A-F = Hex input on all other event elements
  Delete = Deletes the item under the cursor
```  
Currently there is no record mode, you edit all the time. Scrolling with the mouse wheel is the normal way
to work in most components, including the pattern editor, the sequence list and the instrument list.

The toolbar has some basic functionality.

* ![new](http://pgregory.github.io/wetracker/images/new_song_icon.png) - Reset to the default empty song.
* ![save](http://pgregory.github.io/wetracker/images/save_song_icon.png) - Download your current song as WeTracker JSON format.
* ![load](http://pgregory.github.io/wetracker/images/load_song_icon.png) - Load a song, in WeTracker JSON format or FastTrackerII .xm format.
* ![play](http://pgregory.github.io/wetracker/images/play_icon.png) - Play the song from the current position.
* ![play pattern](http://pgregory.github.io/wetracker/images/play_pattern_icon.png) - Play the current pattern in a continuous cycle.
* ![pause](http://pgregory.github.io/wetracker/images/pause_icon.png) - Pause playback.
* ![restart](http://pgregory.github.io/wetracker/images/play_icon.png) - Go back to the start of the song.

You can edit the step and octave values in the toolbar, 
or use "{" and "}" to increment/decrement step, and """ and "|" to increment and decrement octave.
