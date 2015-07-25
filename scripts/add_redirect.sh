#!/usr/local/bin/bash

# Add redirect_from for every post
#
# Example: 2014-09-21-ip.md 

# ---
# layout: blog
# category: reading
# title: xxx
# tags: xxx
# ---

# ->

# ---
# layout: blog
# category: reading
# title: xxx
# tags: xxx
# redirect_from:
#   - /reading/ip.html
#   - /2014/09/21/ip/
# ---


for file in ./.tmp/*    
do
    echo 'migrating:' $file
    fname=${file##.*/}
    basename=${fname%%\.md}
    postname=${basename:11}

    layout=`sed -n '2p' $file | awk -F : '{print $2}'`
    layout="$(echo -e "${layout}" | sed -e 's/\s//g')"

    if [ "$layout" != "blog" ]; then
        echo 'not blog:' $file
        continue
    fi

    line=$(sed -n '3p' $file)
    category=$(echo $line | sed 's/.*:\s*//g' | sed 's/\s//g')

    redirect1=/${category}/${postname}\\\.html
    redirect2=/$(echo ${basename} | sed 's/-/\//g' | sed 's/\//-/g4')/

    cmd="5a redirect_from:\n  - ""${redirect1}"'\n  - '"${redirect2}"
    sed -i "$cmd" $file
done
