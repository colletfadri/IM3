console.log("Script loaded successfully.");

fetch('https://im3.probablyaproject.ch/unload.php')
.then(response => response.json())
.then(data => {
    console.log(data);
})
.catch(error => {
    console.error(error);
});