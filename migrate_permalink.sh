#!/usr/local/bin/bash

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

    targeturl=/$(echo ${basename} | sed 's/-/\//g' | sed 's/\//-/g4').html
    targeturl=$(echo ${targeturl} | sed 's/\//\\\//g');

    sed "s/xxx/$targeturl/g" migrate_permalink_tpl.html > $targetfile
done
