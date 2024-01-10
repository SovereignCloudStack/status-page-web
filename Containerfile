FROM fedora:39

RUN dnf upgrade -y --refresh && \
    dnf install -y nodejs nodejs-npm ripgrep eza fd-find rubygem-mustache python3 python3-dateutil && \
    dnf clean all && \
    npm install -g @angular/cli
