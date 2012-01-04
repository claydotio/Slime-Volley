require 'rake'
require 'rubygems'
require 'sprockets'
require 'uglifier'
require 'fssm'

SRC_PATH = 'src'

desc "Compiles coffeescript."
task :dist do
  env = Sprockets::Environment.new
  env.prepend_path SRC_PATH
  js = env['manifest.js'].to_s 
  File.open('js/game.js', 'w') { |f| f.write(js) }
  minjs = Uglifier.new.compile(js)
  File.open('js/game.min.js', 'w') { |f| f.write(minjs) }
end

desc "Waits for changes to files, then recompiles."
task :watch do
  FSSM.monitor(SRC_PATH) do
    puts "Watching "+SRC_PATH+" directory for changes..."
    update do |base, relative|
      puts "File changed, Recompiling..."
      system "rake dist"
    end
  end
end