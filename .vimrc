" To enable this project vim config, add `set exrc` into your `~/.vimrc`
" Usage: Press `<leader>tags` in normal mode
" Note: make sure your cwd is the project root

nnoremap <leader>tags :read !./scripts/generate_tags.sh % <cr>
