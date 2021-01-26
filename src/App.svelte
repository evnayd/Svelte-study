<script>
let value = '';

$: lowerCaseError = !isValid(value);
$: lengthError = !isValid1(value);
$: upperCaseError = !isValid2(value);
$: numberError = !isValid3(value);

function isValid1(password) {
	return password.length > 7 & password.length < 65;
}

function isValid(password) {
	let lowerCaseArr = password.replace(/([a-z, 0-9])/g, '').split('');
	console.log(lowerCaseArr);
	if (lowerCaseArr.length>0) {
		return true;
	}
	else {
		return false;
	}
}


function isValid2(password) {
	let upperCaseArr = password.replace(/([A-Z, 0-9])/g, '').split('');
	if (upperCaseArr.length>0) {
		return true;
	}
	else {
		return false;
	}
}

function isValid3(password) {
	let num = password.slice();
	let numbers = num.replace(/[^0-9]+/g, "");
	if (numbers.length>0) {
		return true;
	}
	else {
		return false;
	}
}


 function hideValue() {
		if (password.type === 'text') 
		{
			password.type = 'password'}
			else {
				password.type = 'text';
		}
	}

function handleOnSubmit() {
	if (
		lowerCaseError ||  lengthError || upperCaseError || numberError
	)
   { alert('Try another password')
	}

	else {
		alert('Ok');
	}
}

</script>

	<div class="container">
<h1>Change password</h1>
<p>Please enter a new password to complete the password recovery process.</p>
<div>
<input type="text"  id ="password" bind:value/>
<button on:click={hideValue}>HIDE</button>
</div>
<ul>
	<li class:active ={!lengthError}>8-64 characters</li>
	<li class:active ={!lowerCaseError}>1 Lowercase</li>
	<li class:active ={!upperCaseError}>1 Uppercase</li>
	<li class:active ={!numberError}>1 Number</li>
	
</ul>
<button type ="submit" on:click={handleOnSubmit}> Confirm </button>
</div>


<style>
	h1 {
		color: green;
	}

    .active {
		outline : green 2px solid;
	}

	ul {
		width: 200px;
	}

	</style>