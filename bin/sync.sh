git checkout coding-pages && \
echo '[harttle] Merging master' && \
git merge master -m 'merged master'&& \
echo '[harttle] Pushing to coding.net' && \
git push coding.net && \
git checkout master
