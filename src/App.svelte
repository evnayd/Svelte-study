<script>
let value = '';
let inputType = 'text';

$: lengthError = !isValid(value, 'length');
$: lowerCaseError = !isValid(value, 'lowercase');
$: upperCaseError = !isValid(value, 'uppercase');
$: numberError = !isValid(value, 'numbers');


function isValid(password, requirement) {

let upperCaseArr = password.replace(/[^A-Z]+/g, '').split('');
let lowerCaseArr = password.replace(/[^a-z]+/g, '').split('');
let num = password.slice();
let numbers = num.replace(/[^0-9]+/g, '');

 switch(requirement){
case "length":
	  return password.length > 7 & password.length < 65;
	  
case "lowercase":

 return lowerCaseArr.length > 0;

case "uppercase":

return upperCaseArr.length > 0;


case "numbers": 
return numbers.length > 0

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

	<div class="container mx-auto">
		<div class="bg-white w-full  lg:w-1/2 mx-auto shadow-md p-6 xl:p-14 text-left sm:text-center my-16 lg:my-32">
<h1 class="font-black text-xl sm:text-4xl mb-2 sm:mb-8">Change password</h1>
<p>Please enter a new password to complete the password recovery process.</p>
<div class="relative">
<input class="text-gray-500 text-lg w-full border-b-2 mb-2 p-1 outline-none overflow-hidden" type={inputType}   on:input={(e) => (value = e.target.value)} id ="password" />
<button class="absolute bottom-3 right-1 text-gray-300 hover:text-gray-400 focus: outline-none focus: border-none" on:click={hideValue}>HIDE</button>
</div>
<ul class="flex flex-col sm:flex-row justify-between text-sm mb-6 flex-nowrap">
	<li class="w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto"  class:active ={!lengthError}>8-64 characters</li>
	<li class="w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto"  class:active ={!lowerCaseError}>1 Lowercase</li>
	<li class="w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto"  class:active ={!upperCaseError}>1 Uppercase</li>
	<li class="w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto"  class:active ={!numberError}>1 Number</li>
	
</ul>
<button class="w-full bg-purple-700 hover:bg-purple-900 rounded-md p-4 text-white shadow-md font-semibold text-sm  sm:text-xl overflow-hidden"  type ="submit" on:click={handleOnSubmit}> Confirm </button>
</div>
</div>



<style global lang="postcss">

	@tailwind base;
	@tailwind components;
	@tailwind utilities;


    .active {
		outline : green 2px solid;
	}

	ul {
		width: 200px;
	}

	</style>