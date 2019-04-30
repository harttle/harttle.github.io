" To enable this project vim config, add `set exrc` into your `~/.vimrc`
" Usage: Press `<leader>tags` in normal mode
" Note: make sure your cwd is the project root

nnoremap <leader>tg :read !./bin/generate_tags.sh % <cr>

nnoremap <leader>yl :let @+=JekyllLink()<CR>

function! JekyllLink()
    " 2016-06-22-some-thing.md
    let file = expand("%:t")
    let file = split(file, '\.')[0]
    let url = 'https://harttle.land/' . file[0:3] . '/' .file[5:6] . '/' . file[8:9] . '/' . file[11:] . '.html'
    let title = getline(2)
    let link = '[' . title[7:] . '](' . url . ')'
    return link
endfunction
