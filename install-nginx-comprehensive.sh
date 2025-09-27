#!/bin/bash

# Comprehensive Nginx Installation Script
# This script handles multiple Linux distributions and installation methods

echo "🌐 Comprehensive Nginx Installation for adityahospitalnagaon.com"
echo "=============================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if service exists
service_exists() {
    systemctl list-unit-files | grep -q "^$1.service"
}

# Detect Linux distribution
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        echo "📋 Detected: $OS $VER"
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
        echo "📋 Detected: $OS $VER"
    elif [ -f /etc/redhat-release ]; then
        OS="Red Hat Enterprise Linux"
        echo "📋 Detected: $OS"
    elif [ -f /etc/debian_version ]; then
        OS="Debian"
        echo "📋 Detected: $OS"
    else
        OS=$(uname -s)
        echo "📋 Detected: $OS (Generic Unix)"
    fi
}

# Install Nginx based on distribution
install_nginx() {
    echo "📦 Installing Nginx..."
    
    case "$OS" in
        *"CentOS"*|*"Red Hat"*|*"Rocky"*|*"AlmaLinux"*)
            echo "🔧 Installing on RHEL-based system..."
            
            # Try multiple methods
            if command_exists dnf; then
                echo "Using DNF package manager..."
                sudo dnf update -y
                sudo dnf install -y epel-release
                sudo dnf install -y nginx
            elif command_exists yum; then
                echo "Using YUM package manager..."
                sudo yum update -y
                sudo yum install -y epel-release
                sudo yum install -y nginx
            else
                echo "❌ No suitable package manager found"
                return 1
            fi
            ;;
            
        *"Ubuntu"*|*"Debian"*)
            echo "🔧 Installing on Debian-based system..."
            sudo apt update -y
            sudo apt install -y nginx
            ;;
            
        *"Fedora"*)
            echo "🔧 Installing on Fedora..."
            sudo dnf update -y
            sudo dnf install -y nginx
            ;;
            
        *"SUSE"*|*"openSUSE"*)
            echo "🔧 Installing on SUSE..."
            sudo zypper refresh
            sudo zypper install -y nginx
            ;;
            
        *)
            echo "⚠️ Unknown distribution, trying generic installation..."
            
            # Try common package managers
            if command_exists apt; then
                sudo apt update && sudo apt install -y nginx
            elif command_exists yum; then
                sudo yum install -y epel-release && sudo yum install -y nginx
            elif command_exists dnf; then
                sudo dnf install -y nginx
            elif command_exists zypper; then
                sudo zypper install -y nginx
            else
                echo "❌ No supported package manager found"
                return 1
            fi
            ;;
    esac
}

# Alternative installation methods
install_nginx_alternative() {
    echo "🔄 Trying alternative installation methods..."
    
    # Method 1: Direct repository installation
    echo "📦 Method 1: Adding official Nginx repository..."
    
    case "$OS" in
        *"CentOS"*|*"Red Hat"*|*"Rocky"*|*"AlmaLinux"*)
            # Add official Nginx repo for RHEL
            sudo tee /etc/yum.repos.d/nginx.repo > /dev/null <<EOF
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/\$releasever/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
EOF
            
            if command_exists dnf; then
                sudo dnf install -y nginx
            else
                sudo yum install -y nginx
            fi
            ;;
            
        *"Ubuntu"*|*"Debian"*)
            # Add official Nginx repo for Ubuntu/Debian
            curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo apt-key add -
            echo "deb http://nginx.org/packages/ubuntu/ $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
            sudo apt update
            sudo apt install -y nginx
            ;;
    esac
    
    # Method 2: Compile from source (last resort)
    if ! command_exists nginx; then
        echo "📦 Method 2: Compiling from source (this may take a while)..."
        install_nginx_from_source
    fi
}

# Install from source (last resort)
install_nginx_from_source() {
    echo "🛠️ Installing Nginx from source..."
    
    # Install build dependencies
    case "$OS" in
        *"CentOS"*|*"Red Hat"*|*"Rocky"*|*"AlmaLinux"*)
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y pcre-devel zlib-devel openssl-devel wget
            ;;
        *"Ubuntu"*|*"Debian"*)
            sudo apt install -y build-essential libpcre3-dev zlib1g-dev libssl-dev wget
            ;;
    esac
    
    # Download and compile Nginx
    cd /tmp
    wget http://nginx.org/download/nginx-1.24.0.tar.gz
    tar -xzf nginx-1.24.0.tar.gz
    cd nginx-1.24.0
    
    ./configure \
        --prefix=/etc/nginx \
        --sbin-path=/usr/sbin/nginx \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --lock-path=/var/run/nginx.lock \
        --http-client-body-temp-path=/var/cache/nginx/client_temp \
        --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
        --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
        --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
        --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
        --with-http_ssl_module \
        --with-http_realip_module \
        --with-http_addition_module \
        --with-http_sub_module \
        --with-http_dav_module \
        --with-http_flv_module \
        --with-http_mp4_module \
        --with-http_gunzip_module \
        --with-http_gzip_static_module \
        --with-http_random_index_module \
        --with-http_secure_link_module \
        --with-http_stub_status_module \
        --with-http_auth_request_module \
        --with-file-aio \
        --with-http_v2_module
    
    make && sudo make install
    
    # Create systemd service file
    sudo tee /etc/systemd/system/nginx.service > /dev/null <<EOF
[Unit]
Description=The nginx HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP \$MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=process
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    
    # Create necessary directories
    sudo mkdir -p /var/cache/nginx
    sudo mkdir -p /etc/nginx/conf.d
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
}

# Verify installation
verify_installation() {
    echo "🔍 Verifying Nginx installation..."
    
    if command_exists nginx; then
        echo "✅ Nginx binary found: $(which nginx)"
        nginx -v
        return 0
    else
        echo "❌ Nginx binary not found"
        return 1
    fi
}

# Configure Nginx service
setup_nginx_service() {
    echo "⚙️ Setting up Nginx service..."
    
    # Try different service names
    if service_exists nginx; then
        SERVICE_NAME="nginx"
    elif service_exists nginx.service; then
        SERVICE_NAME="nginx.service"  
    else
        echo "❌ Nginx service not found"
        echo "🔍 Available services:"
        systemctl list-unit-files | grep -E "(nginx|http)" | head -5
        return 1
    fi
    
    echo "✅ Using service: $SERVICE_NAME"
    
    # Start and enable service
    sudo systemctl start $SERVICE_NAME
    sudo systemctl enable $SERVICE_NAME
    
    # Check status
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo "✅ Nginx service is running"
        return 0
    else
        echo "❌ Failed to start Nginx service"
        sudo systemctl status $SERVICE_NAME
        return 1
    fi
}

# Main installation process
main() {
    echo "🚀 Starting Nginx installation process..."
    
    # Detect OS
    detect_os
    
    # Check if Nginx is already installed
    if command_exists nginx; then
        echo "ℹ️ Nginx is already installed"
        nginx -v
        if setup_nginx_service; then
            echo "✅ Nginx is ready to use"
            exit 0
        fi
    fi
    
    # Try standard installation
    if install_nginx && verify_installation; then
        echo "✅ Standard installation successful"
    else
        echo "⚠️ Standard installation failed, trying alternatives..."
        if install_nginx_alternative && verify_installation; then
            echo "✅ Alternative installation successful"
        else
            echo "❌ All installation methods failed"
            echo ""
            echo "🔧 Manual installation options:"
            echo "1. Check your Linux distribution documentation"
            echo "2. Visit: https://nginx.org/en/linux_packages.html"
            echo "3. Use Docker: docker run -d -p 80:80 -p 443:443 nginx"
            echo "4. Try Apache instead: ./setup-apache.sh"
            exit 1
        fi
    fi
    
    # Setup service
    if setup_nginx_service; then
        echo ""
        echo "🎉 Nginx installation completed successfully!"
        echo "✅ Nginx version: $(nginx -v 2>&1)"
        echo "✅ Service status: $(systemctl is-active nginx)"
        echo ""
        echo "🔧 Next steps:"
        echo "1. Configure Nginx for your domain"
        echo "2. Set up SSL certificates"
        echo "3. Configure reverse proxy for your application"
        echo ""
        echo "📝 Useful commands:"
        echo "   sudo systemctl status nginx"
        echo "   sudo nginx -t"
        echo "   sudo systemctl reload nginx"
    else
        echo "❌ Nginx installed but service setup failed"
        exit 1
    fi
}

# Run main function
main "$@"