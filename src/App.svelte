<script>
let value = '';

$: error = !isValid(value);
$: error1 = !isValid1(value);
$: error2 = !isValid2(value);
$: error3 = !isValid3(value);

function isValid1(val) {
	return val.length > 7 & val.length < 65;
}

function isValid(val) {
	let arr = val.split('');
	let Newarr = arr.filter(item => item == item.toLowerCase());
	if (Newarr.length>0) {
		return true;
	}
	else {
		return false;
	}
}


function isValid2(val) {
	let arr = val.split('');
	let Newarr = arr.filter(item => item == item.toUpperCase());
	if (Newarr.length>0) {
		return true;
	}
	else {
		return false;
	}
}

function isValid3(val) {
	let numberVarr = val.replace(/[^0-9]+/g, "");
	if (numberVarr.length>0) {
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
	!isValid(value) ||
	!isValid1(value) ||
	!isValid2(value)  ||
	!isValid3(value)
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
<input class="bg-red" type="text" id ="password" bind:value/>
<button on:click={hideValue}>HIDE</button>
</div>
<ul>
	<li class:yes={!error1}>8-64 characters</li>
	<li class:yes={!error}>1 Lowercase</li>
	<li class:yes={!error2}>1 Uppercase</li>
	<li class:yes={!error3}>1 Number</li>
</ul>
<button type ="submit" on:click={handleOnSubmit}> Confirm </button>
</div>


<style>
	h1 {
		color: green;
	}

    .yes {
		outline : green 2px solid;
	}

	ul {
		width: 200px;
	}

	</style>