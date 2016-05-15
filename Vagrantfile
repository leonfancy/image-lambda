# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<SCRIPT
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm update npm -g
sudo apt-get install -y zip
SCRIPT

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.define "slim-lambda" do |config|
    config.vm.network :private_network, ip: "10.11.10.100"
    config.vm.synced_folder ".", "/home/vagrant/slim_lambda"
  end
  config.vm.provision "shell", inline: $script
end
