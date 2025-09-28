cs291
=====

Interactive 3D Graphics class code

Take the class at https://www.udacity.com/course/cs291

Setup
-----

1. Install Node.js if you have not already.
2. From the repository root run `npm install` to download the JavaScript dependencies. This pulls `three@0.106.2`.
3. Open `index.html` (or any of the unit demos) in your browser. Using a small static server such as `npx http-server -c-1` is recommended if your browser restricts local file loading.

IMPORTANT: to run the demo and exercise code in Units 8-10 locally on your own machine, for Chrome you need to add "--allow-file-access-from-files" to your shortcut to enable the use of textures on your machine. Make sure all Chrome processes in the Task Manager are shut down before restarting Chrome with this option. Note that even rebooting won't assure this - chrome.exe processes will often occur on startup. You have to kill these by hand and then run your shortcut. See http://www.chrome-allow-file-access-from-file.com/ for more details.

If you work on exercises with textures locally and then submit your work, you'll need to change one more line at the top of the exercise, something like this:

`var path = "/";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity`

Do as the comment says.

Compatibility Notes
-------------------

The lessons were originally authored against three.js r56. The project now installs r106 (`three@0.106.2`) and loads `lib/three-legacy-compat.js`, which provides shims for removed APIs such as `THREE.CubeGeometry`, `THREE.ParticleSystem`, `THREE.ImageUtils`, `THREE.Projector`, and `renderer.setClearColorHex`. When you add new demos, prefer the modern APIs and remove shims where possible.

You can see the [full migration guide](https://github.com/mrdoob/three.js/wiki/Migration) for changes between versions.
