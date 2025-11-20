project('backgroundwindow',
  version: '1.0',
  meson_version: '>= 0.50.0'
)

# Extension UUID
extension_uuid = 'backgroundwindow@stron.umilab.net'

# Install extension files
extension_dir = join_paths(get_option('datadir'), 'gnome-shell', 'extensions', extension_uuid)

install_data(
  'extension.js',
  'metadata.json',
  'stylesheet.css',
  install_dir: extension_dir
)

# Also install to local user directory for testing
local_extension_dir = join_paths(get_option('prefix'), '.local', 'share', 'gnome-shell', 'extensions', extension_uuid)

install_data(
  'extension.js',
  'metadata.json',
  'stylesheet.css',
  install_dir: local_extension_dir
)
