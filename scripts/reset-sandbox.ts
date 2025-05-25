async function main() {
  console.log('Sandbox reset functionality has been removed. Please use the Supabase dashboard to manage data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  }); 