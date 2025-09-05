
function getNameFromEmail(email)
{
    if (!email || typeof email != "string") return "";
    return email.split("@")[0];
}

export default getNameFromEmail