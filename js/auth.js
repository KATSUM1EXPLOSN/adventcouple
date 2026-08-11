export function checkBiometricSupport(pairCode, callbacks) {
    if (window.PublicKeyCredential) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            .then(available => {
                if (available) {
                    if (localStorage.getItem('biometricsEnabled') === 'true') {
                        callbacks.onBiometricsActive();
                    } else {
                        callbacks.onBiometricsAvailable();
                    }
                }
            });
    }
}

export function registerBiometrics(pairCode, userRole, onSuccess) {
    if (!window.PublicKeyCredential) {
        alert("Ваше устройство или браузер не поддерживают биометрию.");
        return;
    }

    const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        rp: { name: "Чувственный Календарь" },
        user: {
            id: new Uint8Array([1, 2, 3, 4]),
            name: pairCode || "User",
            displayName: userRole === 'p1' ? "Партнер 1" : "Партнер 2"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { authenticatorAttachment: "platform" },
        timeout: 60000
    };

    navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions })
        .then(() => {
            localStorage.setItem('biometricsEnabled', 'true');
            alert("🎉 Вход по Face ID / Touch ID успешно защищен!");
            onSuccess();
        })
        .catch(err => {
            console.log(err);
            alert("Биометрия не активирована или была отменена.");
        });
}

export function authenticateBiometrics(onSuccess) {
    const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        timeout: 60000,
        userVerification: "required"
    };

    navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions })
        .then(() => {
            onSuccess();
        })
        .catch(err => {
            console.log("Ошибка проверки Face ID:", err);
            alert("Ошибка сканирования Face ID! Нажмите кнопку смены настроек, если нужно ввести код заново.");
        });
}
