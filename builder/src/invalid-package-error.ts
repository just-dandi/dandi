import { AppError } from '@dandi/common'

import { InvalidPackageInfo } from './package-info'

export class InvalidPackageError extends AppError {
  private static getPackageMessage(invalidPackages: InvalidPackageInfo[]): string {
    return invalidPackages
      .map(
        ([pkg, invalidDeps]) =>
          `${pkg.fullName} defines ${invalidDeps.length} missing project dependencies: ${invalidDeps}`,
      )
      .join('\n')
  }

  constructor(invalidPackages: InvalidPackageInfo[]) {
    super(
      `${invalidPackages.length} packages have invalid descriptors:\n${InvalidPackageError.getPackageMessage(
        invalidPackages,
      )}`,
    )
  }
}
