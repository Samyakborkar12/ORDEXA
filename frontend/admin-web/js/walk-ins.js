function logout() {

            localStorage.removeItem(
                "ordexa_admin"
            );

            sessionStorage.removeItem(
                "ordexa_admin"
            );

            localStorage.removeItem(
                "ordexa_organization_id"
            );

            localStorage.removeItem(
                "ordexaOrganizationId"
            );

            window.location.href =
                "login.html";

        }
