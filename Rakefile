require 'rake'
require 'rubygems'
require 'uglifier'
require 'fssm'

SRC_PATH = 'src'
BUILD_PATH = 'build/'
OUT_PATH = 'js/game'

desc "Compiles coffeescript."
task :dist do
  manifest = IO.read File.join(SRC_PATH, 'manifest.js')
  files = manifest.scan(/\/\/= require '(.*)'/)
  coffee = files.collect {|m| File.join(SRC_PATH, m[0]+'.coffee')}.join ' '
  #puts "coffee --output #{BUILD_PATH} --compile #{coffee}"
  `coffee -b --output #{BUILD_PATH} --compile #{coffee}`
  if $?.to_i == 0 # cmd ran successfully, continue minification
    puts 'Compiled successfully.'
    js = files.collect {|m| IO.read File.join(BUILD_PATH, File.basename(m[0]+'.js'))}.join "\n"
    minjs = Uglifier.new.compile(js)
    File.open("#{OUT_PATH}.js", 'w') { |f| f.write(js) }
    File.open("#{OUT_PATH}.min.js", 'w') { |f| f.write(minjs) }
    
  end
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