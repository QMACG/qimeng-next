ALTER TABLE `patch`
  ADD COLUMN `published` DATETIME(3) NULL AFTER `view`;

UPDATE `patch`
SET `published` = `created`
WHERE `published` IS NULL;

ALTER TABLE `patch`
  MODIFY COLUMN `published` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE INDEX `patch_visibility_published_idx`
  ON `patch` (`visibility`, `published`);
