require 'rake'
require 'rubygems'
require 'uglifier'
require 'fssm'

CLI_SRC_PATH = './src/client' # path to source code for client side
SVR_SRC_PATH = './src/server' # path to source code for server side
SHARED_SRC_PATH = './src/shared' # path to source code that is shared between client & server
CLI_BUILD_PATH = './build/client' # all individual coffeescript files are compiled to indiv. js files in this path
SVR_BUILD_PATH = './build/server' # all individual coffeescript files are compiled to indiv. js files in this path
CLI_OUT_PATH = './build/client/game' # produces game.js and game.min.js in that build/client

# read_manifest: accepts a directory containing a manifest.js 
# file, and returns an array of the files required in the manifest
# e.g. read_manifest('src/client') => ['A.coffee', 'B.coffee']
def read_manifest(manifest_path)
  manifest = IO.read File.join(manifest_path, 'manifest.js')
  manifest.scan(/\/\/= require '(.*)'/)
end

# join_filenames: accepts an array of filenames and an optional 
# base path, and flattens them into a string for cmd line usage
# e.g. join_filenames(['A.coffee', 'B.coffee'], '../') => "../A.coffee ../B.coffee"
def join_filenames(filenames, base='./')
  filenames.collect {|f| File.expand_path(File.join(base, f)) }.join ' '
end

desc "Compiles client coffeescript."
task :client do
  # read names of required files in manifest.js
  cli_file_array = read_manifest(CLI_SRC_PATH)
  cli_files = join_filenames(
    cli_file_array.collect { |f| f[0]+'.coffee' },
    CLI_SRC_PATH
  )
  # compile everything!
  `coffee -b --output #{CLI_BUILD_PATH} --compile #{cli_files}`
  if $?.to_i == 0 # cmd ran successfully, continue minification
    puts 'Compiled client successfully.'
    js = cli_file_array.collect { |m|
      IO.read File.join(CLI_BUILD_PATH, File.basename(m[0]+'.js'))
    }.join "\n"
    minjs = Uglifier.new.compile(js)
    # build and minify the whole thing into CLI_OUT_PATH
    File.open("#{CLI_OUT_PATH}.js", 'w') { |f| f.write(js) }
    File.open("#{CLI_OUT_PATH}.min.js", 'w') { |f| f.write(minjs) }
  end
end

# no need to minify server-side stuff
desc "Compiles server coffeescript."
task :server do
  srv_files = join_filenames(
    read_manifest(SVR_SRC_PATH).collect { |f| f[0]+'.coffee' }, 
    SVR_SRC_PATH
  )
  `coffee -b --output #{SVR_BUILD_PATH} --compile #{srv_files}`
  puts 'Compiled server successfully.' if $?.to_i == 0
end

# watch and wait for changes, then call `rake client` or
# `rake server` to compile the changes
desc "Waits for changes to files, then recompiles."
task :watch do
  FSSM.monitor do
    puts "Watching for client changes in " + CLI_SRC_PATH
    path CLI_SRC_PATH do
      update do |base, relative|
        puts "Client file changed, Recompiling..."
        system "rake client"
      end
    end
    puts "Watching for server changes in " + SVR_SRC_PATH
    path SVR_SRC_PATH do
      update do |base, relative|
        puts "Server file changed, Recompiling..."
        system "rake server"
      end
    end
    puts "Watching for shared changes in " + SHARED_SRC_PATH
    path SHARED_SRC_PATH do
      update do |base, relative| # recompile everything!
        puts "Server and client dependent file changed, Recompiling..."
        system "rake server"
        system "rake client"
      end
    end
  end
end