# rsfwalters.github.io
Website for Robin Walters' Geometric Learning Lab

## Contribution Guide
1. Go to the [repo page](https://github.com/rsfwalters/rsfwalters.github.io) and fork it.
2. Clone your forked repo:
```
git clone https://github.com/<your-github-username>/rsfwalters.github.io.git
cd rsfwalters.github.io
git checkout -b <branch-name>
```
3. Make any changes you want to the forked codebase.  If you are a lab member, you will probably
be modifying `/pages/geometric-learning-lab.html` or `/pages/research.html` or adding assets to `/images`.  Do not modify `index.html` unless Robin tells you to.
4. Check that you have not broken anything by running the following command.  It will open up a browser and show the full website.  
```
http-server -o
```
If you don't want to set up `http-server`, you can simply double click `index.html` in your file manager to open it in a browser.
5. Commit and push your changes.
```
git add <filenames-that-you-changed>
git commit -m "an informative commit message"
git push --set-upstream origin <branch-name>
```
6. Go to the fork repo page and click the button "New pull request".  Set it up as follows:
 \[base repository: rsfwalters/rsfwalters.github.io\] \[base: main\] <- \[head repository: <your-username>/rsfwalters.github.io\] \[compare: <branch-name>\].
 Then click "Create pull request" to complete the process.
7.  Wait patiently for the PR to be approved and merged.  Alternatively, harass Dian or Robin to approve it faster.
