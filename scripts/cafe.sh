git checkout gitcafe-pages && \
echo '[harttle] Merging master' && \
git merge master && \
echo '[harttle] Pushing to gitcafe...' && \
git push cafe && \
git checkout master
