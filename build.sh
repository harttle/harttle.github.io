#!/bin/bash

jekyll serve --draft  &
jekyll build -w --draft 

function kill_jobs() {
  jobs -p | xargs kill
}

trap kill_jobs EXIT
