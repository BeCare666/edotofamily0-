import CampagnsComponent from "../components/Campagns";

function Campagns() {
    return <CampagnsComponent
        changeView={(view) => console.log(view)}
        showNotification={(msg) => console.log(msg)}
    />
}

export default Campagns;