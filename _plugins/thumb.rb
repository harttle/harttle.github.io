module Jekyll
  class Thumb < Jekyll::Generator
    def generate(site)
        system "cd assets/img/album && make"
    end
  end
end
