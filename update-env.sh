#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default ports
BACKEND_PORT=5000
FRONTEND_PORT=5173

echo -e "${GREEN}=== IP Address Update Script ===${NC}\n"

# Function to get the primary IP address
get_ip_address() {
    # Try multiple methods to get IP address
    
    # Method 1: Get IP from default route interface
    local ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+')
    
    if [ -n "$ip" ]; then
        echo "$ip"
        return 0
    fi
    
    # Method 2: Get first non-loopback inet address
    ip=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -n1)
    
    if [ -n "$ip" ]; then
        echo "$ip"
        return 0
    fi
    
    return 1
}

# Function to update frontend .env
update_frontend_env() {
    local ip=$1
    local env_file="frontend/.env"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}Warning: $env_file not found. Creating new file...${NC}"
        touch "$env_file"
    fi
    
    # Backup existing file
    # cp "$env_file" "${env_file}.backup"
    
    # Update or add VITE_API_BASE_URL
    if grep -q "VITE_API_BASE_URL=" "$env_file"; then
        sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://${ip}:${BACKEND_PORT}/api/v1|g" "$env_file"
    else
        echo "VITE_API_BASE_URL=http://${ip}:${BACKEND_PORT}/api/v1" >> "$env_file"
    fi
    
    # Update or add VITE_SOCKET_URL
    if grep -q "VITE_SOCKET_URL=" "$env_file"; then
        sed -i "s|VITE_SOCKET_URL=.*|VITE_SOCKET_URL=http://${ip}:${BACKEND_PORT}|g" "$env_file"
    else
        echo "VITE_SOCKET_URL=http://${ip}:${BACKEND_PORT}" >> "$env_file"
    fi
    
    echo -e "${GREEN}✓ Updated $env_file${NC}"
}

# Function to update backend .env
update_backend_env() {
    local ip=$1
    local env_file="backend/.env"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}Warning: $env_file not found. Creating new file...${NC}"
        touch "$env_file"
    fi
    
    # Backup existing file
    # cp "$env_file" "${env_file}.backup"
    
    # Update or add CLIENT_URL (note the space around =)
    if grep -q "CLIENT_URL" "$env_file"; then
        sed -i "s|CLIENT_URL.*=.*|CLIENT_URL = http://${ip}:${FRONTEND_PORT}|g" "$env_file"
    else
        echo "CLIENT_URL = http://${ip}:${FRONTEND_PORT}" >> "$env_file"
    fi
    
    echo -e "${GREEN}✓ Updated $env_file${NC}"
}

# Function to show current IP in env files
show_current_config() {
    echo -e "\n${YELLOW}Current Configuration:${NC}"
    
    if [ -f "frontend/.env" ]; then
        echo -e "\n${GREEN}Frontend (.env):${NC}"
        grep "VITE_API_BASE_URL\|VITE_SOCKET_URL" frontend/.env 2>/dev/null || echo "  No VITE URLs found"
    fi
    
    if [ -f "backend/.env" ]; then
        echo -e "\n${GREEN}Backend (.env):${NC}"
        grep "CLIENT_URL" backend/.env 2>/dev/null || echo "  No CLIENT_URL found"
    fi
    echo ""
}

# Main script execution
main() {
    # Check if we're in the project root
    if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        echo -e "${RED}Error: Must be run from project root directory${NC}"
        echo "Expected structure: ./frontend and ./backend directories"
        exit 1
    fi
    
    # Get IP address
    IP_ADDRESS=$(get_ip_address)
    
    if [ -z "$IP_ADDRESS" ]; then
        echo -e "${RED}Error: Could not detect IP address${NC}"
        echo "Please manually check with: ip a"
        exit 1
    fi
    
    echo -e "Detected IP Address: ${GREEN}$IP_ADDRESS${NC}"
    echo -e "Backend Port: ${GREEN}$BACKEND_PORT${NC}"
    echo -e "Frontend Port: ${GREEN}$FRONTEND_PORT${NC}\n"
    
    # Ask for confirmation
    read -p "Update .env files with this IP? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Update cancelled${NC}"
        exit 0
    fi
    
    # Update both env files
    update_frontend_env "$IP_ADDRESS"
    update_backend_env "$IP_ADDRESS"
    
    echo -e "\n${GREEN}✓ All .env files updated successfully!${NC}"
    echo -e "${YELLOW}Backup files created: .env.backup${NC}"
    
    # Show updated configuration
    show_current_config
    
    echo -e "${YELLOW}Note: Restart your dev servers for changes to take effect${NC}"
}

# Run main function
main