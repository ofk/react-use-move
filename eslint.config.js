import config from '@ofk/eslint-config-recommend';

export default config({
  extends: [
    {
      files: ['tests/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ],
  ignores: ['dist', 'coverage'],
});
