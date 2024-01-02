FROM fedora:39

RUN dnf upgrade -y --refresh && \
    dnf install -y nodejs nodejs-npm ripgrep eza fd-find && \
    dnf clean all && \
    npm install -g @angular/cli
