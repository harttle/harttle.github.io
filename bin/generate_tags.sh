#!/bin/bash
# usage: generate_tags.sh xxx.md

# generate tag list 
grep name ./_site/api/tags.json | awk -F : '{print $2}' | tr -d ',\" '  > /tmp/tags.txt

# match tag string
grep $1 -oFf /tmp/tags.txt | sort | uniq | tr '\n' ' ' | sed 's/ $//'; echo ''
