#!/usr/local/bin/bash

# generate 301 HTML for every post, example: 

# file 2014-09-21-ip.md: 
# ---
# layout: blog
# category: reading
# title: xxx
# tags: xxx
# ---

# ->

# file ./reading/ip.html:
# <html>
# <head lang="en">
#   <meta charset="UTF-8">
#   <meta http-equiv="refresh" content="0; url=/2014/09/21/ip.html">
#   <link rel="canonical" href="/2014/09/21/ip.html" />
# </head>
# </html>

for file in ./_posts/*    
do
    echo 'migrating:' $file
    fname=${file##.*/}
    basename=${fname%%\.md}
    urlname=${basename:11}

    layout=`sed -n '2p' $file | awk -F : '{print $2}'`
    layout="$(echo -e "${layout}" | sed -e 's/\s//g')"

    if [ "$layout" != "blog" ]; then
        echo 'not blog:' $file
        continue
    fi
    line=$(sed -n '3p' $file)
    category=$(echo $line | sed 's/.*:\s*//g' | sed 's/\s//g')

    targetfile=./${category}/${urlname}.html
    targeturl=http://harttle.github.io/$(echo ${basename} | sed 's/-/\//g' | sed 's/\//-/g4').html
    targeturl=$(echo ${targeturl} | sed 's/\//\\\//g');

    sed "s/xxx/$targeturl/g" migrate_permalink_tpl.html > $targetfile
done
